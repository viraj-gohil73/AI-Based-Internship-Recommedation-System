import mongoose from "mongoose";

const Company = new mongoose.Schema({
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
    companyName:{
        type: String,
    },
},{timestamps: true});
export default mongoose.model("Company", Company);