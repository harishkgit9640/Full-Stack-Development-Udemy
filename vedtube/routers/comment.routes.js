import { Router } from "express";
import { addComment } from '../controllers/comment.controllers.js';

const router = Router()
router.route('/add').post(addComment);


export default router