const path = require('node:path')
const auth = require('./utils/authorization')
const config = require('../config')
const dao = require('../db/dao')
const fs = require('./middleware/filesystem')
const serializer = require('./serialize/serializers')
const { httpErrorResponse, paginateResponseData } = require('./serialize/schemes')
const { reprState } = require('./errorState')


async function signin(request, response){
    try{
        const jwtCredentials = await auth.jwtAuth.recordCredentials(request)
        return response.status(201).json(jwtCredentials)
    }
    catch(error){
        return httpErrorResponse(response, error)
    }
}

async function newToken(request, response){
    try{
        const jwtCredentials = await auth.jwtAuth.recordCredentials(request)
        return response.status(201).json(jwtCredentials)
    }
    catch(error){
        return httpErrorResponse(response, error)
    }
}

async function signup(request, response){
    try{
        const credentials = await auth.basicAuth.recordCredentials(request)
        return response.status(201).json(
            credentials
        )
    }
    catch(error){
        return httpErrorResponse(response, error)
    }
}

async function file(request, response){
    const userId = request.userId
    const fileId = request.params.id
    const file = await dao.getFile(fileId, userId)

    if (!file){
        return httpErrorResponse(response, { 
            statusCode: 404, 
            message: 'File not found' 
        })
    }

    return response.status(200).json({
        message: 'Success',
        result: serializer.FileResponseSerializer.serialize(file)
    })
}

async function fileList(request, response){
    const userId = request.userId
    const pagination = paginateResponseData(request)
    const [files, total] = await dao.getFiles(userId, pagination)

    console.log(`Type of files list: ${typeof(files)}`)

    return response.status(200).json({
        ...serializer.FileListSerializer.serialize(files),
        ...pagination,
        total: total
    })
}


async function fileDownload(request, response){
    const fileId = request.params.id
    const file = await dao.getFile(fileId, request.userId)

    if (file){
        console.log(`PROCESSED`)
        return response.status(200).download(path.resolve(config.FILE_UPLOAD_PATH, request.userId.toString()))
    }   
}

async function fileDelete(request, response){
    const userId = request.userId
    const fileId = request.params.id
    try{
        await fs.deleteFile(fileId, userId)
    }
    catch (error){
        return httpErrorResponse(response, error)
    }
    return response.status(200).json({
        message: 'Delete success',
        detail: `File id: ${fileId}`
    }) 
}

async function fileUpdate(request, response){
    const userId = request.userId
    const fileId = parseInt(request.params.id)
    var created = false
    var file
    try {
        file = await dao.updateFileDescr(
            serializer.FileUpdateSerializer.serialize(request.file), 
            fileId, 
            userId
        )

        if (!file){
            request.file.id = fileId
            file = await dao.createFileDescr(
                serializer.FileUploadSerializer.serialize(request.file)
            )
            created = true
        }

        if (created){
            return response.status(201).json({
                message: `Success. File with id=${fileId} was created.`, 
            })
        }
        return response.status(200).json({
            message: `Success. File with id=${fileId} was updated.`, 
        })
    }
    catch (error) {
        if (file){
            try{
                await fs.deleteFile(fileId, userId)
            }
            catch(errorDelete){
                //
            } 
        }
        if (error instanceof dao.UniqueConstraintError){
            return httpErrorResponse(response, reprState.conflict(error.message))
        }
        return httpErrorResponse(response, error)
    }
}

async function fileUpload(request, response){
    try {
        const file = await dao.createFileDescr(
            serializer.FileUploadSerializer.serialize(request.file)
        )
        return response.status(201).json({ 
            message: 'Success', 
            result: serializer.FileResponseSerializer.serialize(file) 
        })
    }
    catch (error) {
        return httpErrorResponse(response, error)
    }
}

function info(request, response){
    return response.status(200).json({ 
        id: request.userId 
    })
}

async function logout(request, response){
    const encryptedToken = request.headers['authorization']
    await auth.jwtAuth.expirePreviousTokenIds(
        [encryptedToken],
        decrypt=true,
        findRelated=true
    )

    return response.status(200).json(
        { message: 'Logout success' }
    )
}

module.exports = {
   signin,
   newToken,
   signup,
   file,
   fileList,
   fileDownload,
   fileDelete,
   fileUpdate,
   fileUpload,
   info,
   logout
}