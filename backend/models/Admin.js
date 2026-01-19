import mongoose from "mongoose"

const Admin = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    dp:{
        type:String,
    },
    mobile:{
        type:String
    }
},{timestamps:true});

export default mongoose.model("Admin", Admin);