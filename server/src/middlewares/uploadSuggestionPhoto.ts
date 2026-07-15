import { suggestionUploadsDir } from "../config/uploads";
import { createImageUploader } from "./createImageUploader";

const suggestionPhotoUploader = createImageUploader({
  uploadDir: suggestionUploadsDir,
  urlPrefix: "/uploads/suggestions",
  maxSizeMb: 10,
  verifyMagicBytes: true,
});

export const uploadSuggestionPhoto = suggestionPhotoUploader.middleware;
export const getSuggestionPhotoUrl = suggestionPhotoUploader.getUrl;
export const deleteSuggestionUploadedFile = suggestionPhotoUploader.deleteUploadedFile;
export const deleteSuggestionPhotoByUrl = suggestionPhotoUploader.deletePhotoByUrl;
