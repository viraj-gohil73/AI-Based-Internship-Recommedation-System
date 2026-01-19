import Company from "../models/Company.js";
export const createCompany = async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();

    res.status(201).json({
      success: true,
      message: "Company saved successfully",
      data: company
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyCompany = async (req, res) => {
  const company = await Company.findById(req.companyId);

  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
    });
  }

  res.json({
    success: true,
    data: company,
  });
};

export const submitVerification = async (req, res) => {
  try {
    const companyId = req.companyId;

    const company = await Company.findById(companyId);
  console.log("SUBMIT VERIFICATION API HIT");
    console.log("companyId from token:", req.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // ❌ Already submitted
    if (company.verificationStatus === "SUBMITTED") {
      return res
        .status(400)
        .json({ message: "Profile already submitted for verification" });
    }

    // ❌ Already approved (no re-submit)
    if (company.verificationStatus === "APPROVED") {
      return res
        .status(400)
        .json({ message: "Company already approved" });
    }

    // ❌ Mandatory profile validation
    if (
      !company.companyName ||
      !company.email ||
      !company.website ||
      !company.reg_doc
    ) {
      return res.status(400).json({
        message: "Please complete all required profile fields",
      });
    }

    // ✅ Submit for verification
    company.verificationStatus = "SUBMITTED";
    await company.save();

    res.status(200).json({
      success: true,
      message: "Profile submitted for verification",
      company, // 🔥 send updated data
    });
  } catch (error) {
    console.error("Submit verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

