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
  ["image/heic", ".heic"],
  ["image/heif", ".heif"],
]);

const heifBrands = ["heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif1", "msf1"];
const isHeifContainer = (buf: Buffer) =>
  buf.length >= 12 &&
  buf.subarray(4, 8).toString("ascii") === "ftyp" &&
  heifBrands.includes(buf.subarray(8, 12).toString("ascii"));

const magicNumberCheckers: Record<string, (buf: Buffer) => boolean> = {
  "image/jpeg": (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  "image/png": (buf) =>
    buf.length >= 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/webp": (buf) =>
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP",
  "image/heic": isHeifContainer,
  "image/heif": isHeifContainer,
};

const extensionToMimeType = new Map(
  Array.from(allowedImageExtensions, ([mimeType, ext]) => [ext, mimeType]),
);
const genericMimeTypes = new Set(["application/octet-stream", ""]);

// Some mobile browsers report a generic mimetype for HEIC/HEIF files; fall back to the file extension.
function resolveMimeType(file: Express.Multer.File): string | undefined {
  if (allowedImageExtensions.has(file.mimetype)) return file.mimetype;
  if (!genericMimeTypes.has(file.mimetype)) return undefined;

  return extensionToMimeType.get(path.extname(file.originalname).toLowerCase());
}

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
      const resolved = resolveMimeType(file);
      if (!resolved) {
        cb(new Error("Можно загрузить только JPG, PNG, WEBP или HEIC"));
        return;
      }

      file.mimetype = resolved;
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
