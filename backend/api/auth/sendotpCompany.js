import { sendEmail } from "../../utils/sendEmail.js";
import Company from "../../models/Company.js";

export const sendOtp = async (req, res) => {
  try {
    const { cname, email, password } = req.body;
    console.log(email);
    if (!email) return res.status(400).json({  success: false,message: "Email is required" });
    if(!cname) return res.status(400).json({  success: false,message: "Company name is required" });
    /*if(!lname) return res.status(400).json({  success: false,message: "lname is required" });
*/
    const existingCompany = await Company.findOne({ email });
  
    if (existingCompany)
      return res.status(400).json({
        success: false,
        message: "Company already exists. Please login.",
      });

    const otp = Math.floor(100000 + Math.random() * 900000);
      console.log("otp ",otp)
    // Send mail
    const emailContent = `
Hi ${email.split('@')[0]}, 👋

Thank you for using our platform!

Your One-Time Password (OTP) for email verification is:

🔐 OTP: ${otp}

Please enter this code within 10 minutes to complete your verification.

⚠️ Do not share this code with anyone for your account's security.

If you didn’t request this, you can safely ignore this message.

Best regards,  
Internship Finder Team  
📧 support@internshipfinder.com  
© ${new Date().getFullYear()} Internship Finder | All rights reserved.
`;

const sent = await sendEmail(email, "Your OTP Code", emailContent);

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
