// backend/api/auth/verify-otp.js
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // ---------- Validation ----------
    if (!email || !otp || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and role are required",
      });
    }

    if (!global.tempOtps || !global.tempOtps[normalizedEmail]) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    const savedOtpData = global.tempOtps[normalizedEmail];

    // ---------- Role check ----------
    if (savedOtpData.role !== role) {
      return res.status(400).json({
        success: false,
        message: "OTP role mismatch",
      });
    }

    // ---------- Expiry check (10 minutes) ----------
    const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 min
    const isExpired = Date.now() - savedOtpData.createdAt > OTP_EXPIRY_TIME;

    if (isExpired) {
      delete global.tempOtps[normalizedEmail];
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // ---------- OTP match ----------
    if (parseInt(savedOtpData.otp) !== parseInt(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ---------- Success ----------
    delete global.tempOtps[normalizedEmail];

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
