import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { sendError } from "../utils/response";

const allowedImageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const magicNumberCheckers: Record<string, (buf: Buffer) => boolean> = {
  "image/jpeg": (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  "image/png": (buf) =>
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (buf) =>
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP",
};

async function matchesClaimedType(filePath: string, claimedMimeType: string): Promise<boolean> {
  const checker = magicNumberCheckers[claimedMimeType];
  if (!checker) return false;

  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(12);
    await handle.read(buffer, 0, 12, 0);
    return checker(buffer);
  } finally {
    await handle.close();
  }
}

export function createImageUploader(params: {
  uploadDir: string;
  urlPrefix: string;
  maxSizeMb: number;
  fieldName?: string;
  verifyMagicBytes?: boolean;
}) {
  const { uploadDir, urlPrefix, maxSizeMb, fieldName = "photo", verifyMagicBytes = false } = params;

  fs.mkdirSync(uploadDir, { recursive: true });

  const uploader = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const ext = allowedImageExtensions.get(file.mimetype) ?? ".bin";
        cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
      },
    }),
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      if (!allowedImageExtensions.has(file.mimetype)) {
        cb(new Error("Можно загрузить только JPG, PNG или WEBP"));
        return;
      }

      cb(null, true);
    },
  });

  function middleware(req: Request, res: Response, next: NextFunction) {
    uploader.single(fieldName)(req, res, async (err: unknown) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return sendError(res, `Фото должно быть не больше ${maxSizeMb} МБ`, 400);
      }

      if (err instanceof Error) {
        return sendError(res, err.message, 400);
      }

      if (verifyMagicBytes && req.file) {
        const valid = await matchesClaimedType(req.file.path, req.file.mimetype);
        if (!valid) {
          await fs.promises.rm(req.file.path, { force: true });
          return sendError(res, "Файл повреждён или не является изображением заявленного формата", 400);
        }
      }

      next();
    });
  }

  function getUrl(file?: Express.Multer.File) {
    return file ? `${urlPrefix}/${file.filename}` : undefined;
  }

  async function deleteUploadedFile(file?: Express.Multer.File) {
    if (!file) return;
    await fs.promises.rm(file.path, { force: true });
  }

  async function deletePhotoByUrl(photoUrl: string) {
    const prefix = `${urlPrefix}/`;

    if (!photoUrl.startsWith(prefix)) return;

    const filename = path.basename(photoUrl);
    await fs.promises.rm(path.join(uploadDir, filename), { force: true });
  }

  return { middleware, getUrl, deleteUploadedFile, deletePhotoByUrl };
}
