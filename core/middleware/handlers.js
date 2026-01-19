const { httpErrorResponse } = require('../serialize/schemes')

function handler405Error(request, response, next) {

  var flag = false;
  for (var i = 0; i < request.route.stack.length; i++) {
    if (request.method == request.route.stack[i].method) {
      flag = true;
    }
  }
  if (!flag) {
    error = new Error('Method Not Allowed')
    error.status = 405;
    return next(error)
  }

  next();
}

function errorHandler(error, request, response, next) {
  if (error){
    return httpErrorResponse(response, error)
  }
  next()
}

module.exports = {
  errorHandler,
  handler405Error
}