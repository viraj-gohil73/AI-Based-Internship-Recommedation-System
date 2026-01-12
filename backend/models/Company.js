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
    logo:{
        type:String,
    },
    tagline:{
        type: String,
    },
    industry_type:{
        type:String
    },
    company_size:{
        type:Number
    },
    founded_year:{
        type:Number
    },
    website:{
        type:String
    },
    about:{
        type:String
    },
    address_line1:{
        type:String
    },
    address_line2:{
        type:String
    },
    city:{
        type:String
    },
    state:{
        type:String
    },
    pincode:{
        type:Number
    },
    gst_no:{
        type:String
    },
    secondary_email:{
        type:String
    },
    mobile_no:{
        type:String,
    },
    reg_doc:{
        type:String
    }, 
    isVerified:{
        type: Boolean,
        default: false,
    }

},{timestamps: true});
export default mongoose.model("Company", Company);