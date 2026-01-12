export const googleCallbackCompany = (req, res) => {
  if (!req.user) {
    console.log("Authentication failed: No user data");
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
  res.redirect(`${process.env.FRONTEND_URL}/company-dashboard`);
};
