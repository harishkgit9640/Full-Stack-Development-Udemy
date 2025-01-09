import { ApiResponse } from '../utils/ApiResponse.js'
import { ErrorResponse } from '../utils/ErrorResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/user.models.js'
import { uploadOnCloudinary } from '../middlewares/cloudinary.js'

const registerUser = asyncHandler(async (req, res) => {

    const { fullname, username, email, password } = req.body

    if ([fullname, username, email, password].some((field) => field.trim() === "")) {
        throw new ErrorResponse(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ErrorResponse(409, "User with username or email already exists!")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ErrorResponse(400, "Avatar file is required")
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


})

export { registerUser }