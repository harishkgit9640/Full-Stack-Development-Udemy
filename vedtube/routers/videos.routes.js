import express from 'express';
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = express.Router();

router.use(verifyJWT)
router.route('/add-video').post();
router.route('/get-videos').get();
router.route('/get-videos/:videoId').get();

export default router;
