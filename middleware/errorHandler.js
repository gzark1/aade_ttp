function errorHandler(err, req, res, next) {
    console.error(err.stack);
  
    if (err.name === 'InvalidCredentialsError') {
      // Redirect to the login page with an error message
      res.redirect(`/login?service=${req.body.service}&error=invalid_credentials`);
    } else if (err.statusCode) {
      return res.status(err.statusCode).render('error', {message: err.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  module.exports = errorHandler;
  