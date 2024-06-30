class InvalidServiceError extends Error {
    constructor() {
      super('This service does not exist or has not been implemented yet.');
      this.name = 'InvalidServiceError';
      this.statusCode = 404;
    }
  }
  
module.exports = InvalidServiceError;
  