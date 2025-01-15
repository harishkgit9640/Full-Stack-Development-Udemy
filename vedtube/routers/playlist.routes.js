import { Router } from "express";

const router = Router()
router.route(verifyJWT)
router.route('/add').post(playlist);

export default router