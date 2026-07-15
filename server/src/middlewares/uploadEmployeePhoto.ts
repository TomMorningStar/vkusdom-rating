import { employeeUploadsDir } from "../config/uploads";
import { createImageUploader } from "./createImageUploader";

const employeePhotoUploader = createImageUploader({
  uploadDir: employeeUploadsDir,
  urlPrefix: "/uploads/employees",
  maxSizeMb: 5,
});

export const uploadEmployeePhoto = employeePhotoUploader.middleware;
export const getEmployeePhotoUrl = employeePhotoUploader.getUrl;
export const deleteEmployeeUploadedFile = employeePhotoUploader.deleteUploadedFile;
export const deleteEmployeePhotoByUrl = employeePhotoUploader.deletePhotoByUrl;
