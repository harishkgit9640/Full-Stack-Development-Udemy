import { ApiResponse } from '../utils/ApiResponse.js'
import { ErrorResponse } from '../utils/ErrorResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import jwt from 'jsonwebtoken'
import { uploadOnCloudinary, deleteFromCloudinary } from '../middlewares/cloudinary.js'

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ErrorResponse(404, "User not found!");
        }
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ErrorResponse(500, "Error generating refresh token and refresh token", error);
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body

    if ([fullname, username, email, password].some((field) => field.trim() === "")) {
        throw new ErrorResponse(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ErrorResponse(401, "User with username or email already exists!")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ErrorResponse(400, "Avatar file is required")
    }
    if (!coverImageLocalPath) {
        throw new ErrorResponse(400, "coverImage file is required")
    }

    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // let coverImage = ""
    // if (coverImageLocalPath) {
    //     coverImage = await uploadOnCloudinary(coverImageLocalPath)
    // }

    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)

    } catch (error) {
        throw new ErrorResponse(500, "while uploading Avatar Image")

    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)

    } catch (error) {
        throw new ErrorResponse(500, "while uploading coverImage")
    }

    try {
        const user = await User.create({
            fullname,
            username: username.toLowerCase(),
            email,
            password,
            avatar: avatar?.url,
            coverImage: coverImage?.url || "",
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken")
        if (!createdUser) {
            throw new ErrorResponse(500, "Something went wrong while creating a new user!");
        }

        return res
            .status(201)
            .json(new ApiResponse(200, createdUser, "User created successfully!"))
    } catch (error) {

        if (avatar) {
            await deleteFromCloudinary(avatar.public_id)
        }

        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id)
        }
        throw new ErrorResponse(500, "Something went wrong, avatar and coverImage were deleted" + error);
    }


})

const logInUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    if (!email.trim() && !password.trim()) {
        throw new ErrorResponse(401, "email and password are required user name is optional");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (user.refreshToken || req?.cookies?.refreshToken) {
        res.status(200).json(new ApiResponse(200, user, "User Already Logged In"))
    }

    if (!user) {
        throw new ErrorResponse(401, "User with username or email is not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ErrorResponse(401, "Invalid password!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse(200,
            { user: loggedInUser, accessToken, refreshToken },
            "User Logged In Successfully"
        ))

})

const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req?.user?._id, {
        // $set: { refreshToken: undefined }
        $unset: { refreshToken: 1 }
    }, { new: true })
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User Logged Out Successfully"))
})

const refreshToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ErrorResponse(401, "unAuthorized request")
    }
    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedRefreshToken._id)
        if (!user) {
            throw new ErrorResponse(401, "Invalid refresh token")
        }
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)
        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(new ApiResponse(200,
                { user, accessToken, newRefreshToken },
                "Refresh token generated Successfully"
            ))
    } catch (error) {
        throw new ErrorResponse(401, "Error while generating refresh token", error)
    }

})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req?.user?._id)
    if (!user) {
        throw new ErrorResponse(404, "User not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched Successfully"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body // {oldPassword,nePassword}
    const user = await User.findById(req.user._id)
    if (!user) { throw new ErrorResponse(404, "User not found"); }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ErrorResponse(401, "Invalid old password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, username } = req.body
    if (!email || !username) {
        throw new ErrorResponse(400, "username and email are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ErrorResponse(401, "User with username or email already exists!")
    }

    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ErrorResponse(404, "User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(req?.user?._id, {
        $set: {
            email,
            username
        }
    }, { new: true }).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ErrorResponse(401, "avatar Image not found")
    }
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath)
    } catch (error) {
        throw new ErrorResponse(500, "while updating User Avatar")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar?.url
        }
    }).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"))

})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ErrorResponse(401, "cover Image not found")
    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    } catch (error) {
        throw new ErrorResponse(500, "while updating User coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: coverImage?.url
        }
    }).select("-password -refreshToken")
    return res.status(200).json(new ApiResponse(200, user, "User coverImage updated successfully"))

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    $pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ]

                }
            }
        ]
    )

    if (!user?.length) {
        throw new ErrorResponse(404, "User not found")
    }

    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "User watch history"))

})


const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params

    if (!username.trim()) {
        throw new ErrorResponse(400, "username is required")
    }

    const channel = await User.aggregate(
        [
            {
                $match: { username: username?.trim().toLowerCase() }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscriptions"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscriptionTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscriptions"
                    },
                    channelSubscribedTo: {
                        $size: "$subscriptionTo",
                        isSubscribed: {
                            $cond: {
                                if: { $in: [req.user._id, "subscribers"] },
                                then: true,
                                else: false
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    subscribersCount: 1,
                    channelSubscribedTo: 1,
                    isSubscribed: 1
                }
            }
        ]
    )
    if (!channel?.length) {
        throw new ErrorResponse(404, "Channel not found")
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile"))

})


export { registerUser, logInUser, logOutUser, refreshToken, getCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }