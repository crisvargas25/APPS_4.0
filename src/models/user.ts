import { Document, Schema, model, Types } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    phone: string;
    createdDate: Date;
    deleteDate: Date;
    status: boolean;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    deleteDate: {
        type: Date,
        required: false,
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },
});


export const User = model<IUser>('User', userSchema, 'user')