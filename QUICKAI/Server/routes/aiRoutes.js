import express from 'express';
import { auth } from '../middleware/auth.js';
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, 
removeImageObject, resumeReview } from '../controllers/aiController.js';
import {Upload} from '../config/multer.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);

aiRouter.post('/generate-image', auth, generateImage);
aiRouter.post('/remove-image-background', Upload.single('image'), auth, removeImageBackground);

aiRouter.post('/remove-image-object', Upload.single('image'), auth, removeImageObject);
aiRouter.post('/resume-review', Upload.single('resume'), auth, resumeReview);


export default aiRouter;
