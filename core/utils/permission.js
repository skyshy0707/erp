/*
Module is designed to check user object (file) ownership
and throwing enought exceptions for processing appropriate 
http response
*/

const dao = require('../../db/dao')
const { reprState, statement } = require('../errorState')


async function getFileDescr(fileId, userId, byId=false){
    try{
        return await dao.getFile(fileId, userId, byId)
    }
    catch (error){
        return null
    }
}

class filePermission{

    pkName = 'user_id'

    async getInstance(pk){
        return await getFileDescr(pk, null, true)
    }
    async isOwn(pk, ownerId, notExistExc=true){
        const instance = await this.getInstance(pk)

        if (!instance && notExistExc){
            throw statement(reprState.doesnt_exist(
                `File doesn\'t exist with id=${pk}`
            ))
        }
        if (instance && instance[this.pkName] != ownerId){
            throw statement(reprState.not_enough_rights(
                `You don\'t have permissions for this action`
            ))
        }

        return instance
    }
}

const fileOwnership = new filePermission()

module.exports = fileOwnership