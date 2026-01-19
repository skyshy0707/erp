const fs = require('node:fs')
const multer = require('multer')
const path = require('node:path')
const codes = require('node:os')

const config = require('../../config')
const dao = require('../../db/dao')
const { reprState, statement } = require('../errorState')

const UPDATE_FILE_URL = /\/file\/update\/[\d]+/


async function getFileDescr(fileId, userId, byId=false){
    try{
        return await dao.getFile(fileId, userId, byId)
    }
    catch (error){
        throw statement(reprState.doesnt_exist)
    }
}

async function deleteFile(fileId, userId){
    const file = await getFileDescr(fileId, userId)

    const failMessage = `Fail to delete file with this id=${fileId}`

    if (!file){
        throw statement(reprState.fail_to_delete(failMessage))
    }
    
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
        throw statement(reprState.fail_to_delete(failMessage))
    }
}

async function generateUserFileName(originalname, request){

    
    const userId = request.userId
    const fileId = request.params?.id || null
    const url = request.url
    const file = await getFileDescr(fileId, userId, true)
    
    const fileDir = path.resolve(config.FILE_UPLOAD_PATH, userId.toString())
    //const fileDir = path.resolve(config.FILE_UPLOAD_PATH, "26")
    const filePath = path.resolve(fileDir, originalname)
    //return path.parse(originalname).name + `_${Date.now()}` + path.extname(originalname)


    if (url.match(UPDATE_FILE_URL)){
        if (file && file.user_id != userId){
            throw statement(reprState.not_enough_rights())
        }
        const oldFileName = path.resolve(fileDir, file.name)
        try{
            await fs.promises.stat(oldFileName)
            await fs.promises.unlink(oldFileName)
        }
        catch (error){
            //pass
        }
    }
    /*if (file){
        const oldFileName = path.resolve(fileDir, file.name)
        if (url.match(UPDATE_FILE_URL)){
            try{
                await fs.promises.stat(oldFileName)
                await fs.promises.unlink(oldFileName)
            }
            catch (error){
                //pass
            }
        }
    }*/

    try{ 
        await fs.promises.stat(filePath) 
        return path.parse(originalname).name + `_${Date.now()}` + path.extname(originalname)
    }
    catch (error){
        return originalname
    }
    


    /*try {
        if (await fs.promises.stat(filePath)){
            return path.parse(originalname).name + `_${Date.now()}` + path.extname(originalname)
        }   
    }
    catch (error){
        try{
            await fs.promises.stat(fileDir)
            //return originalname
        }
        catch (error){
            if(error.code == codes.constants.errno.ENOENT){  
                await fs.promises.mkdir(path.resolve(fileDir))
                //return originalname
            }
            
            else {
                console.log(`fs error keys: ${Object.keys(error)}, stack - ${error.stack}`)
                throw status.fail_to_upload(error.message)
            }
        }
    }*/
    
}

const storage = multer.diskStorage({
    destination: async (request, file, callback) => {
        console.log(`Userid: ${request.userId}`)

        const fileDir = path.resolve(config.FILE_UPLOAD_PATH, request.userId.toString())
        //const fileDir = path.resolve(config.FILE_UPLOAD_PATH, "26")
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
        
        console.log(`File name ${filename} was generated successfully`)
      
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