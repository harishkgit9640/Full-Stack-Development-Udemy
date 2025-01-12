import { ApiResponse } from '../utils/ApiResponse.js'
import { ErrorResponse } from '../utils/ErrorResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary, deleteFromCloudinary } from '../middlewares/cloudinary.js'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user) {
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
    console.log("coverImage : " + req.files?.coverImage)
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
        console.log(avatar);

    } catch (error) {
        throw new ErrorResponse(500, "while uploading Avatar Image")

    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
        console.log(coverImage);

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
        throw new ErrorResponse(500, "Something went wrong while creating a new user!" + error);
    }


})

const logInUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body

    if (!email && !password) {
        throw new ErrorResponse(401, "email and password are required user name is optional");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ErrorResponse(401, "User with username or email is not exist!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new Error(401, "Invalid password!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

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
})

const refreshToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
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
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ErrorResponse(404, "User not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched Successfully"))
})

export { registerUser, logInUser, logOutUser, refreshToken, getCurrentUser }