const checkauth = (req, res, next) => {
  if (req?.session && req?.session?.user && req?.session?.user?.user_id) {
    // User is authenticated, proceed to the next middleware/route handler
    next();
  } else {
    // User is not authenticated, redirect to login page
    res.redirect('/login');
  }
}
module.exports = { checkauth };