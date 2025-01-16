import express from 'express';
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = express.Router();

router.route(verifyJWT)
router.route('/like').post();
router.route('/unlike').post();