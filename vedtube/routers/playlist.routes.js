import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addPlayList, getPlayLists, updatePlayLists, deletePlayLists } from "../controllers/playlist.controllers.js";


const router = Router()
router.use(verifyJWT)
router.route('/add-playlist').post(addPlayList);
router.route('/get-playlist').get(getPlayLists);
router.route('/update-playlist/:playListId').patch(updatePlayLists);
router.route('/delete-playlist/:playListId').delete(deletePlayLists);

export default router