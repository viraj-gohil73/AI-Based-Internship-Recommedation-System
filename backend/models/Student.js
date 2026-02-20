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
    address1:{
        type: String,
    },
    address2:{
        type: String,
    },
    city:{
        type: String,
    },
    state:{
        type: String,
    },
    pincode:{
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
    languages:{
        type: [String],
    },
    hobbies:{
        type: [String],
    },
    certificates: [
        {
            name: { type: String, default: "" },
            organization: { type: String, default: "" },
            certificateType: { type: String, default: "" },
            techStack: { type: [String], default: [] },
            issueDate: { type: String, default: "" },
            expiryDate: { type: String, default: "" },
            hasExpiry: { type: Boolean, default: false },
            status: { type: String, default: "active" },
            credentialId: { type: String, default: "" },
            credentialUrl: { type: String, default: "" },
            certificateFile: { type: String, default: "" },
            certificateFileName: { type: String, default: "" },
            description: { type: String, default: "" },
        }
    ],
    educations: [
        {
            instituteName: { type: String, default: "" },
            boardOrUniversity: { type: String, default: "" },
            degreeType: { type: String, default: "" },
            fieldOfStudy: { type: String, default: "" },
            specialization: { type: String, default: "" },
            startYear: { type: String, default: "" },
            endYear: { type: String, default: "" },
            status: { type: String, default: "pursuing" },
            courseType: { type: String, default: "" },
            gradeType: { type: String, default: "" },
            gradeValue: { type: String, default: "" },
            location: { type: String, default: "" },
            description: { type: String, default: "" },
        }
    ],
    projects: [
        {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            projectType: { type: String, default: "" },
            techStack: { type: [String], default: [] },
            startDate: { type: String, default: "" },
            endDate: { type: String, default: "" },
            liveUrl: { type: String, default: "" },
            thumbnail: { type: String, default: "" },
        }
    ],
    socialLinks: [
        {
            platform: { type: String, default: "" },
            url: { type: String, default: "" },
            username: { type: String, default: "" },
        }
    ],
    savedInternships: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
        }
    ],
    appliedInternships: [
        {
            internship: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Internship",
                required: true,
            },
            appliedAt: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"],
                default: "APPLIED",
            },
        }
    ],
    isactive:{
        type: Boolean,
        default: true,
    },
},{timestamps: true});

export default mongoose.model("Student", studentSchema);
