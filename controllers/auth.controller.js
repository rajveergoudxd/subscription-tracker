import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// What is a req body? -> req.body is an object containing data from the client (POST request)

export const signUp = async (req, res, next) => {
    // Implement sign up logic here
    console.log("Starting the session and transaction.")
    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Started Transaction Successfully.")

    try {
        // Create a new user
        const { name, email, password } = req.body;
        console.log("Let's create a new user.")
        // Check if a user already exists
        const existingUser = await User.findOne({email}).session(session);
        console.log("Let's check and validate if this user already exists.")
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        console.log("let's hash the password")
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log("let's create this user finally")
        const newUsers = await User.create([{name, email, password: hashedPassword}], { session });

        console.log("Create an JWT token")
        const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        console.log("Everything went fine.")
        await session.commitTransaction();
        console.log("Transaction Committed")
        session.endSession();
        console.log("Session ended")
        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token, 
                user: newUsers[0]
            }
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    // Implement sign in logic here
}

export const signOut = async (req, res, next) => {
    // Implement sign out logic here
}