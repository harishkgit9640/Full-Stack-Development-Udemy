import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/ErrorResponse";

const addVideo = asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: "Add Video" });
})


export { addVideo }