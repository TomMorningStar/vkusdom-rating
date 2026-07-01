import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { employeeUploadsDir } from "../config/uploads";
import { sendError } from "../utils/response";

const allowedImageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

fs.mkdirSync(employeeUploadsDir, { recursive: true });

const employeePhotoUploader = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, employeeUploadsDir),
    filename: (_req, file, cb) => {
      const ext = allowedImageExtensions.get(file.mimetype) ?? ".bin";
      cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageExtensions.has(file.mimetype)) {
      cb(new Error("Можно загрузить только JPG, PNG или WEBP"));
      return;
    }

    cb(null, true);
  },
});

export function uploadEmployeePhoto(req: Request, res: Response, next: NextFunction) {
  employeePhotoUploader.single("photo")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, "Фото должно быть не больше 5 МБ", 400);
    }

    if (err instanceof Error) {
      return sendError(res, err.message, 400);
    }

    next();
  });
}

export function getEmployeePhotoUrl(file?: Express.Multer.File) {
  return file ? `/uploads/employees/${file.filename}` : undefined;
}

export async function deleteEmployeeUploadedFile(file?: Express.Multer.File) {
  if (!file) return;
  await fs.promises.rm(file.path, { force: true });
}

export async function deleteEmployeePhotoByUrl(photoUrl: string) {
  const prefix = "/uploads/employees/";

  if (!photoUrl.startsWith(prefix)) return;

  const filename = path.basename(photoUrl);
  await fs.promises.rm(path.join(employeeUploadsDir, filename), { force: true });
}
