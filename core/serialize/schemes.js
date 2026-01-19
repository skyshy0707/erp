const path = require('node:path')
const { reprState } = require('../errorState')

const BasicAuthResponse = {
    include: [
        "@all"
    ],
    exclude: [
        "password", "salt", "email", "phone", "updatedAt", "createdAt"
    ]
}

const TokenResponse = {
    include: [
        "@all", 'refreshToken'
    ],
    exclude: [
        "@pk"
    ],

    as: {

        salt: 'salted',
        created: {
            method: (instance) => instance.property,
            default: null
        }
    },

    assoc: {
        field: {
            
            how: "<SERIALIZER> | scheme as Object",
            scalar: "field"
        }
    }
}

const FileResponse = {
    include: [
        "@all"
    ],
}

const FileUpload = {
    exclude: [
        'fieldname',
        'originalname',
        'encoding',
        'destination',
        'path'
    ],

    as: {
        filename: 'name',
        mimetype: 'mime_type',
        extension: {
            method: (instance) => path.extname(instance.filename) 
        },
        user_id: {
            method: (instance) => parseInt(instance.destination.split('/').at(-1))
        }
    }
}

const FileUpdate = Object.assign({}, FileUpload)
FileUpdate.exclude.push("@virtual")

const paginateResponseData = (request) => {

    const limit = parseInt(request.query.limit) || 10
    const offset = parseInt(request.query.offset) || 0

    return {
        offset: offset,
        limit: limit,
    }
}
const httpErrorResponse = (response, error) => {

    var statusCode = error.statusCode || error.code || 500

    if (typeof statusCode != 'number'){
        try{
            statusCode = parseInt(statusCode)
        }
        catch(error){
            statusCode = 500
        }
    }


    return response.status(statusCode).json(
        {
            message: (error.body ? error.body.message : error.message) || error,
            detail: error.detail || statusCode == 500 ? error.stack : null
        }
    )
}


module.exports = {
    FileResponse,
    FileUpdate,
    FileUpload,
    BasicAuthResponse,
    TokenResponse,
    httpErrorResponse,
    paginateResponseData
}