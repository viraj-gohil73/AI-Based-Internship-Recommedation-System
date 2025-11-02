// backend/api/auth/verify-otp.js
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    if (!global.tempOtps || !global.tempOtps[email])
      return res.status(400).json({ message: "No OTP found or expired" });

    if (parseInt(global.tempOtps[email]) === parseInt(otp)) {
     // delete global.tempOtps[email];
      return res.status(200).json({success: true, message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("verifyOtp Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
