class InvalidCredentialsError extends Error {
    constructor(message) {
      super(message);
      this.name = "InvalidCredentialsError";
      this.statusCode = 401; // Unauthorized
    }
  }
  
  module.exports = InvalidCredentialsError;
  