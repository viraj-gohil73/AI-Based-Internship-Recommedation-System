import { sendEmail } from "../../utils/sendEmail.js";
import Student from "../../models/Student.js";

export const sendOtp = async (req, res) => {
  try {
    const { email , role } = req.body;
    console.log(email);
    if (!email) return res.status(400).json({ message: "Email is required" });
    //if(!role) return res.status(400).json({ message: "Role is required" });
    
    let existingUser;
    //if (role === "student")
       existingUser = await Student.findOne({ email });
    //else if (role === "company") existingUser = await Company.findOne({ email });

    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login.",
      });

    const otp = Math.floor(100000 + Math.random() * 900000);
      console.log("otp ",otp)
    // Send mail
    const sent = await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);
    if (!sent) return res.status(500).json({ success: false, exist: false, message: "Cannot send email" });

    // You can store OTP in DB or memory (for demo)
    global.tempOtps = global.tempOtps || {};
    global.tempOtps[email] = otp;

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
