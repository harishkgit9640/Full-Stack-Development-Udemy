import mongoose from "mongoose";
import { DB_NAME } from '../src/constant.js';

const MONGODB_URI = "mongodb://localhost:27017";
const connectDB = async () => {
    try {
        // console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // const databaseInstance = mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
        const databaseInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`mongodb connected Successfully 🛞`)
        // console.log(`mongodb connected db host : ${databaseInstance.connection.host}`)
    } catch (error) {
        console.log(`database connection error: ${error}`);

    }

}

export default connectDB