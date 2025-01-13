import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import User from '../models/user.models.js';

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookie.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) { throw new ErrorResponse(401, "Unauthorized access"); }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if (!user) { throw new ErrorResponse(401, "Unauthorized access"); }
        req.user = user;
        next();

    } catch (error) {
        throw new ErrorResponse(401, "Unauthorized invalid access token" + error.message);
    }
})

export { verifyJWT }