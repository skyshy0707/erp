const fs = require('node:fs')
const codes = require('node:os')
const path = require('node:path')
const multer = require('multer')

const config = require('../../config')
const dao = require('../../db/dao')
const fileOwnership = require('../utils/permission')
const { reprState, statement } = require('../errorState')


const UPDATE_FILE_URL = /\/file\/update\/[\d]+/


async function deleteFile(fileId, userId){
    const file = await fileOwnership.isOwn(fileId, userId)
    const filename = file.name
    const filePath = path.resolve(config.FILE_UPLOAD_PATH, userId.toString(), filename)

    try{
        await fs.promises.unlink(filePath)
        await dao.deleteFile(fileId, userId)
    }
    
    catch (error){
        if(codes.constants.errno[error.code] == codes.constants.errno.ENOENT){
            throw statement(
                reprState.doesnt_exist(
                    `Requested file with id=${fileId} doesn't exist anymore`
                )
            )
        }
        throw statement(reprState.fail_to_delete(
            `Fail to delete file with this id=${fileId}`)
        )
    }
}

async function generateUserFileName(originalname, request){
    const userId = request.userId
    const fileId = request.params?.id || null
    const url = request.url
    const file = await fileOwnership.isOwn(fileId, userId, notExistExc=false)
    const fileDir = path.resolve(config.FILE_UPLOAD_PATH, userId.toString())
    const filePath = path.resolve(fileDir, originalname)

    if (url.match(UPDATE_FILE_URL) && file){
        const oldFileName = path.resolve(fileDir, file.name)
        try{
            await fs.promises.stat(oldFileName)
            await fs.promises.unlink(oldFileName)
        }
        catch (error){
            //pass
        }
    }
    try{ 
        await fs.promises.stat(filePath) 
        return path.parse(originalname).name + `_${Date.now()}` + path.extname(originalname)
    }
    catch (error){
        return originalname
    }
   
}

const storage = multer.diskStorage({
    destination: async (request, file, callback) => {
        const fileDir = path.resolve(config.FILE_UPLOAD_PATH, request.userId.toString())
        try{
            await fs.promises.stat(fileDir)
        }
        catch (error){
            await fs.promises.mkdir(path.resolve(fileDir))
        }
        callback(null, fileDir)
    },

    filename: async (request, file, callback) => {
        var filename
        try{
            filename = await generateUserFileName(file.originalname, request)
        }
        catch (error){
            callback(error)
            return
        }
        callback(null, filename)
    }
})

const upload = multer({ 
    storage: storage
})
const uploadStorage = upload.single('file')

module.exports = {
    uploadStorage,
    deleteFile
}