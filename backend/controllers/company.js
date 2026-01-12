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