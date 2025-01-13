import { Router } from "express";
import { registerUser, logInUser, logOutUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ])
    , registerUser)

// secure routes
router.route('/login').post(logInUser)
router.route('/logout').post(verifyJWT, logOutUser)

export default router