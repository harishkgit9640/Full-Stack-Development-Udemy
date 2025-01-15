
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";


const addPlayList = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { videoId } = req.params;
    if (!name || !description) { throw new ErrorResponse(400, "name and description are required"); }
    const playlist = await Playlist.create({
        name,
        description,
        videos: [videoId],
        owner: req.user._id
    })
    return res.status(200)
        .json(new ApiResponse(200, playlist, "playlist added successfully"));
})

const getPlayLists = asyncHandler(async (req, res) => {
    const playlist = await Playlist.find({ owner: req.user._id })
    if (!playlist) throw new ErrorResponse(404, "Playlist not found")
    return res.status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));

})

const updatePlayLists = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) throw new ErrorResponse(400, "name and description are required")
    const playlist = await Playlist.findByIdAndUpdate(req.params.playlistId, {
        name,
        description
    })
    if (!playlist) throw new ErrorResponse(404, "Playlist not found")
    return res.status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"))

})

const deletePlayLists = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findByIdAndDelete(req.params.playlistId)
    if (!playlist) throw new ErrorResponse(404, "Playlist not found")
    return res.status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted successfully"))

})



export { addPlayList, getPlayLists, updatePlayLists, deletePlayLists }