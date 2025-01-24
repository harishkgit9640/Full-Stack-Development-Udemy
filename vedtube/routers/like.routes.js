import express from 'express';
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = express.Router();

router.use(verifyJWT)
router.route('/like').post();
router.route('/unlike').post();

export default router;