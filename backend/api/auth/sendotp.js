import { sendEmail } from "../../utils/sendEmail.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    console.log(`OTP for ${email}: ${otp}`);

    // Send mail
    const sent = await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);
    if (!sent) return res.status(500).json({ message: "Cannot send email" });

    // You can store OTP in DB or memory (for demo)
    global.tempOtps = global.tempOtps || {};
    global.tempOtps[email] = otp;

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
