export const googleCallback = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
  res.redirect(`${process.env.FRONTEND_URL}/student-dashboard`);
};
