import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";

// What is a req body? -> req.body is an object containing data from the client (POST request)

export const signUp = async (req, res, next) => {
    // Implement sign up logic here
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create a new user
        const { name, email, password } = req.body;

        // Check if a user already exists
        const existingUser = await User.findOne({email});

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await user.create([{name, email, password: hashedPassword}], { session });

        const token = jwt.sign({ userId: newUsers[0]._id}, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN}); 

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
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