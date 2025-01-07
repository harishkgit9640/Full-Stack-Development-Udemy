import mongoose from "mongoose";
import { DB_NAME } from '../src/constant.js';

const MONGODB_URI = "mongodb://localhost:27017";
const connectDB = async () => {
    try {
        const databaseInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`mongodb connected Successfully 🛞`)
    } catch (error) {
        console.log(`database connection error: ${error}`);

    }

}

export default connectDB