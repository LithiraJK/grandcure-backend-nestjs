import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ storage });

const allowedDocumentMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const documentUploadOptions: multer.Options = {
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 3,
	},
	fileFilter: (_req, file, cb) => {
		if (!allowedDocumentMimeTypes.has(file.mimetype)) {
			cb(new Error('Only JPEG, PNG, and WEBP files are allowed'));
			return;
		}

		cb(null, true);
	},
};
