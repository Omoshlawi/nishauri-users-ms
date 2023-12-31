import slugify from "slugify";
import multer from "multer";
import path from "path";
import fs from "fs";
import { MEDIA_ROOT, configuration } from "../utils";

const ensureFolderExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const fileUploader = ({ dest }: { dest: string }) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const destinationFolder = path.join(MEDIA_ROOT, dest);
      ensureFolderExists(destinationFolder);
      cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        slugify(configuration.name) +
          "-" +
          slugify(configuration.version) +
          "-" +
          Date.now() +
          "-" +
          slugify(file.originalname, { lower: true, trim: true })
      );
    },
  });

  return multer({ storage });
};

export default fileUploader;
