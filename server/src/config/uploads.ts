import path from "node:path";

export const uploadsRoot = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
);

export const employeeUploadsDir = path.join(uploadsRoot, "employees");
export const suggestionUploadsDir = path.join(uploadsRoot, "suggestions");
