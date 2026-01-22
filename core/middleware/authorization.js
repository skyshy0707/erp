const auth = require('../utils/authorization')
const dao = require('../../db/dao')
const { httpErrorResponse } = require('../serialize/schemes')
const { reprState } = require('../errorState')

const basicAuth = async function (request, response, next){
    try{
        const [id, password] = await auth.basicAuth.verify(request.headers['authorization'])
        
        request.userId = auth.basicAuth.encodeBase64(id)
    }
    catch(error){
        return httpErrorResponse(response, error)
    }
    next()
}

const bearerAuth = async function(request, response, next){

    var id
    try{
        ({ id, refresh } = await auth.jwtAuth.verify(
            request.headers['authorization'], 
            salt=null, 
            checkEncryptedInstance=true)
        )
        if (refresh != Boolean(request.url.match(/\/signin\/new_token/))){
            return httpErrorResponse(
                response, 
                reprState.unsupported_token()
            )
        }
    }
    catch (error){
        return httpErrorResponse(response, error)
    }
    const user = await dao.getUser(id)
    request.userId = refresh ? auth.jwtAuth.encodeBase64(user.email) : user.id
    next()
}

module.exports = {
    basicAuth,
    bearerAuth
}