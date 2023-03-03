import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media/");
  },
  filename: (req, file, cb) => {
    const fileExtenssion = file.mimetype.split("/")[1];
    cb(null, `${Math.random().toString(32).substring(7)}.` + fileExtenssion);
  },
});

const upload = multer({ storage });

export default upload;
