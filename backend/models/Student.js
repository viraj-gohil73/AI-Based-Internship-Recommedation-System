import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    fname:{
        type: String,
        required: true,
    },
    lname:{
        type: String,
        required: true,
    },

},{timestamps: true});

export default mongoose.model("Student", studentSchema);