const { httpErrorResponse } = require('../serialize/schemes')

function errorHandler(error, request, response, next) {
  if (error){
    return httpErrorResponse(response, error)
  }
  next()
}

module.exports = {
  errorHandler
}