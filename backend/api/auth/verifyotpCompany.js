// backend/api/auth/verify-otp.js
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    if (!global.tempOtps || !global.tempOtps[normalizedEmail])
      return res.status(400).json({ message: "No OTP found" });

    if (parseInt(global.tempOtps[normalizedEmail]) === parseInt(otp)) {
      delete global.tempOtps[normalizedEmail];
      return res.status(200).json({success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("verifyOtp Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
