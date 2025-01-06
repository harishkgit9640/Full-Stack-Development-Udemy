import mongoose from "mongoose";
import { DB_NAME } from '../src/constant.js';
const connectDB = () => {
    try {
        const databaseInstance = mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`mongodb connected db host : ${databaseInstance.connection.host}`)
    } catch (error) {
        console.log(`database connection error: ${error}`);

    }

}

export default connectDB