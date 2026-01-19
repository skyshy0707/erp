const { Op } = require('@sequelize/core')


const { 
    QueryTypes, 
    DatabaseError, 
    UniqueConstraintError, 
    BaseError,
    SequelizeValidationError,
    ValidationError
} = require('sequelize')

const db = require('./models/index')

async function createUser(data){
    for (let key of Object.keys(data)){
        console.log(`${key} = ${data[key]}, length: ${data[key].length}`)
    }
    try {
        return await db.User.create(data)
    }
    catch (error){
        console.log(`Error at create user: ${error.stack}`)
        if (error.name == 'SequelizeUniqueConstraintError'){
            throw new UniqueConstraintError(error.message, [error])
        }
        throw new ValidationError(error.message, [error])
    }
    
}

async function createJWTToken(data){


    try{
        return await db.JWTToken.create(data)
    }
    catch (error){
        if (error.name == 'SequelizeUniqueConstraintError'){
            throw new UniqueConstraintError(error.message, [error])
        }
        throw new ValidationError(error.message, [error])
    }
    
}

async function getUser(id){


    /*return await db,sequelize.query(
        `SELECT `
    )*/
    return await db.User.findOne({
        where: {
            [Op.or]: {
                email: id,
                phone: id
            }
        }
    })
}

async function getJWTToken(token){
    const result = await db.sequelize.query(
        `SELECT jwtToken.*, rToken.token AS refreshToken from JWTTokens jwtToken 
        LEFT JOIN JWTTokens rToken ON jwtToken.token = rToken.that_refreshes 
        WHERE jwtToken.token = :token LIMIT 1`,
        {
            replacements: { token: token },
            type: QueryTypes.SELECT
        }
    )

    return result[0]



    /*return await db.Token.findOne({
        include: { 
            model: db.JWTToken, 
            as: 'refreshToken', 
            throwgh: { 
                attributes: [
                    'token'
                ] 
            } 
        },
        where: {
            token: token
        }
    })*/
}


async function getOrCreateDevice(info, ip){
    return await db.Device.findOrCreate({
        where: {
            info: info, 
            ip: ip
        }
    })
}
    
async function getOrCreateUserAgent(deviceId, userId){

    const user = await getUser(userId)

    return await db.UserAgent.findOrCreate({
        where: {
            device_id: deviceId,
            user_id: user.id
        }
    })
}

async function getUserAgentId(info, ip, userId){

    const [device,] = await getOrCreateDevice(info, ip)
    const [userAgent,] = await getOrCreateUserAgent(device.id, userId)
    const userAgentId = userAgent.id

    /*await db.JWTToken.update({
            expired: true
        },
        {
            where: { 
                user_agent_id: userAgentId,
                expired: false
            }
        }
    )*/
    return userAgentId
}

async function expirePreviousTokens(tokenIds){

    await db.JWTToken.update(
        {
            expired: true
        },
        {
            where: {
                token: tokenIds
            }
        }
    )
    /*db.JWTToken.update(
        {
            expired: true
        },
        {
            where: {
                token: [token.id, token.that_refreshes]
            }
        }
    )*/
}
 

async function createFileDescr(model){
    return await db.FileDescriptor.create(model)
}

async function getFile(id, userId, byId=false){

    var whereClause = {
        id: id,
        user_id: userId
    }

    if (byId){
        delete whereClause.user_id
    }
    
    try{
        return await db.FileDescriptor.findOne({ 
            where: whereClause
        })
    }
    catch (error){
        console.log(`error name : ${error.name}`)
        if (error.name == 'SequelizeBaseError'){
            throw BaseError(error.message, [error])
        }
    }
    
}

async function deleteFile(id, userId){
    return await db.FileDescriptor.destroy({
        where: {
            id: id,
            user_id: userId
        }
    })
}

async function getFiles(userId, pagination){

    const { count, rows } = await db.FileDescriptor.findAndCountAll({
        ...pagination,
        where: {
            user_id: userId
        }
    })

    return [rows, count]
}


async function updateFileDescr(model, fileId, userId){
    var [instance] = await db.FileDescriptor.update(
        model,
        { 
            where: {
                id: fileId,
                user_id: userId
            }
        }
    )

    console.log(`Instnace keys: ${Object.keys(instance)}, ${instance}`)
    if (!Object.keys(instance)){


        instance = null
    }

    return instance
}


module.exports  = {
    createFileDescr,
    createJWTToken,
    createUser,
    getFile,
    getFiles,
    getUser,
    getJWTToken,
    getOrCreateDevice,
    getOrCreateUserAgent,
    getUserAgentId,
    deleteFile,
    expirePreviousTokens,
    updateFileDescr,
    DatabaseError,
    UniqueConstraintError,
    BaseError, 
    SequelizeValidationError,
    ValidationError
}