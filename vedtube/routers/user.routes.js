import { Router } from "express";
import { registerUser, logInUser, logOutUser, refreshToken, getCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controllers.js";
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

router.route('/login').post(logInUser)
router.route('/refresh-token').post(refreshToken)

// secure routes
router.route('/logout').post(verifyJWT, logOutUser)
router.route('/get-user').get(verifyJWT, getCurrentUser)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/change-avatar').patch(verifyJWT,
    upload.single("avatar"), updateUserAvatar)
router.route('/change-coverImage').patch(verifyJWT,
    upload.single("coverImage"), updateUserCoverImage)
router.route('/update-account').patch(verifyJWT, updateAccountDetails)
router.route('/get-channel-profile/:username').get(verifyJWT, getUserChannelProfile)
router.route('/get-watch-history').get(verifyJWT, getWatchHistory)

export default router