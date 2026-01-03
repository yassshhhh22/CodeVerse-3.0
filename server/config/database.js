import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js";
import logger from "./logger.js";

export const connectDB = async (uri) => {
  try {
    const connectionOptions = {
      dbName: DB_NAME,
    };

    const conn = await mongoose.connect(uri, connectionOptions);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected");
    });

    return conn;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;
