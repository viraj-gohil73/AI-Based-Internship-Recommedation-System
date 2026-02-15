import mongoose from "mongoose";

const RecruiterSchema = new mongoose.Schema({
    dp:{
        type:String,
        default: "",
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
    },
    role:{
        type:String,
        enum:["RECRUITER","HR","MANAGER"],
        default:"RECRUITER",
    },
    gender:{
        type:String,
        enum:["MALE","FEMALE","OTHER"],
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    last_login:{
        type:Date,
    },
    isactive:{
        type:Boolean,
        default:true,
    },
    canpost:{
        type:Boolean,
        default:true,
    },
    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        required:true,
    },
},{timestamps:true});

export default mongoose.models.Recruiter || mongoose.model("Recruiter", RecruiterSchema);