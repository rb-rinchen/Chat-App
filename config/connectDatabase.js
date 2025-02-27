import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";


const url =process.env.DATABASE_URL;

export const connectDatabase = async () => {
    try {
        await mongoose.connect(url);
        console.log("MongoDB is successfully connected");
    } catch (error) {
        console.error("Database connection error:", error);
    }
};
