import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        console.log(`Connection String: ${process.env.MONGODB_URL}/${DB_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`); 
        console.log(`MONGO DB connected !! DB Host : ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("MONGO DB CONNECTION ERROR : ", error);
        process.exit(1);
    }
}

export default connectDB