import { Router } from "express";
import { addComment, getComments, getCommentById, updateComment, deleteComment } from '../controllers/comment.controllers.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route(verifyJWT)
router.route('/:videoId').post(addComment);
router.route('/get-comments').get(getComments);
router.route('/:commentId').get(getCommentById);
router.route('/:commentId').patch(updateComment);
router.route('/:commentId').delete(deleteComment);


export default router