import slugify from "slugify";
import multer from "multer";
import path from "path";
import { MEDIA_ROOT } from "../utils";

// const uploads = multer({ dest: "../media/uploads" });

const fileUploader = ({ dest }: { dest: string }) => {
  const storage = multer.diskStorage({
    destination: path.join(MEDIA_ROOT, dest), //create folder if dont exists
    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() +
          "-" +
          slugify(file.originalname, { lower: true, trim: true })
      ); // filename
    },
  });

  return multer({ storage });
};

export default fileUploader;
