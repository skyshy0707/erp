const auth = require('../utils/authorization')
const { httpErrorResponse } = require('../serialize/schemes')
const { reprState } = require('../errorState')
const dao = require('../../db/dao')

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

/*const bearerAuthRefreshToken = async function(request, response, next){
    try{
        const credentials = await auth.jwtAuth.verify(request.headers['authorization'], salt=null, throwExc=true)

        console.log(`credentials.refresh ? ${credentials.refresh}`)
        if (credentials.refresh){
            next()
            return 
        }
    }
    catch (error){
        console.log(`Error at refresh roken: ${Object.keys(error)}, - ${error}`)
        return httpErrorResponse(response, error)
    }
    return httpErrorResponse(
        response, 
        reprState.unsupported_token()
    )
}*/

const bearerAuth = async function(request, response, next){

    var id
    try{
        ({ id, refresh } = await auth.jwtAuth.verify(request.headers['authorization'], salt=null, checkEncryptedInstance=true))
        console.log(`Retrieved credentials: ${id}:${refresh}, REQUEST URL: ${request.url}`)

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
    bearerAuth,
    //bearerAuthRefreshToken
}