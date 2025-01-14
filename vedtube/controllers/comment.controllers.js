
import { Comment } from "../models/comment.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ErrorResponse } from "../utils/ErrorResponse.js";

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
    if (!content) { throw new ErrorResponse(400, "Content is required"); }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    return res.status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully"));

})

const getComments = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId
    const comments = await Comment.find(
        { $or: { video: videoId, owner: req.user._id } }
    )
    return res.status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));

})

const getCommentById = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) throw new ErrorResponse(404, "Comment not found")
    return res.status(200)
        .json(new ApiResponse(200, comment, "Comment fetched successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) throw new ErrorResponse(401, "Content is required")
    const comment = await Comment.findByIdAndUpdate(req.params.commentId, {
        content,
    })
    if (!comment) throw new ErrorResponse(404, "Comment not found")
    return res.status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findByIdAndDelete(req.params.commentId)
    if (!comment) throw new ErrorResponse(404, "Comment not found")
    return res.status(200)
        .json(new ApiResponse(200, comment, "Comment deleted successfully"))
})


export { addComment, getComments, getCommentById, updateComment, deleteComment }