import Company from "../models/Company.js";

/* =====================================================
   GET कंपनियां जिनका approval pending है
   (SUBMITTED + RESUBMISSION)
===================================================== */

export const getSubmittedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      verificationStatus: { $in: ["SUBMITTED"] },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch submitted companies",
    });
  }
};

/* =====================================================
   ADMIN RESPONSE: APPROVE / REJECT / RESUBMIT
===================================================== */

export const respondToCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // allowed admin actions
    const allowedActions = [
      "APPROVED",
      "REJECTED",
      "RESUBMISSION",
    ];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin action",
      });
    }

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Only allow response if company is submitted or resubmitted
    if (
      !["SUBMITTED", "RESUBMISSION"].includes(
        company.verificationStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company is not in approval state",
      });
    }

    company.verificationStatus = action;
    await company.save();

    return res.status(200).json({
      success: true,
      message: `Company ${action.toLowerCase()} successfully`,
      data: {
        companyId: company._id,
        verificationStatus: company.verificationStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update company status",
    });
  }
};

/* =====================================================
   SINGLE COMPANY DETAILS (VIEW)
===================================================== */

export const getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company details",
    });
  }
};


export const getApprovedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({
      verificationStatus: "APPROVED",
    }).sort({ createdAt: -1 });

    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch approved companies",
    });
  }
};


/* ================= BLOCK / UNBLOCK COMPANY ================= */
export const toggleCompanyActive = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isactive = isActive;
    await company.save();

    res.status(200).json({
      message: company.isactive ? "Company unblocked" : "Company blocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Action failed" });
  }
};
