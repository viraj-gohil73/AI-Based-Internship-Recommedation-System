import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
    },
    googleId:{
        type: String,
    },
    linkedInId:{
        type: String,
    },
    loginType: {
        type: String,
        enum: ["email", "google", "linkedin"],
        default: "email" 
    },
    fname:{
        type: String,
    },
    lname:{
        type: String,
    },
    profilePic:{
        type: String,
    },
    dob:{
        type: Date,
    },
    gender:{
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    phone_no:{
        type: String,
    },
    skills:{
        type: [String],
    },
    resume:{
        type: String,
    },
    address:{
        type: String,
    },
    preferredLocation:{
        type: String,
    },
    hobbies:{
        type: [String],
    },
},{timestamps: true});

export default mongoose.model("Student", studentSchema);