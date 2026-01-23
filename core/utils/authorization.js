/*
Module including authorization classes `BasicAuth` and `JWTAuth` 
that provides enought functionality to encode credentials, 
create authorization data, and save it to database.

These classes are used in authorization middleware in this project
*/

const assert = require('node:assert/strict')
const { Base64 } = require("js-base64")
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const requestIp = require('request-ip')

const config = require('../../config')
const dao = require('../../db/dao')
const { reprState, statement } = require('../errorState')
const serializers = require('../serialize/serializers')


class Auth{

    static instance

    alg = 'sha256'
    method = 'Token'
    saltLength = 128

    credentialCategories = {
        fromRequest: [],
        decode: []
    }

    decryptAuth(authStr){
        if (typeof(authStr) != 'string'){
            throw statement(
                reprState.token_not_provided
            )
        }
        let [method, token] = authStr.split(' ')

        if (!method.startsWith(this.method)){
            throw statement(
                reprState.unappropriate_method_auth
            )
        }
        return token
    }

    getSuffix(fieldName){
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    }

    generateSalt(){ 
        return crypto.randomBytes(this.saltLength).toString('hex')
    }

    decodeBase64(value){
        return Base64.decode(value)
    }

    encodeBase64(value){
        return Base64.encode(value)
    }

    fromRequest(request){
        const fieldset = this.credentialCategories.fromRequest
        var fields = {}
        const source = request.body || request.params || request.query

        for (let fieldName of fieldset){
            if (!source){
                break
            }
            let fieldValue = source[fieldName]

            if (fieldValue){
                fields[fieldName] = fieldValue
                var decoding = this.credentialCategories.decode

                for (let decodeMethod of Object.keys(decoding)){
                    var method = this['decode' + this.getSuffix(decodeMethod)]
                    if (decoding[decodeMethod].includes(fieldName)) {
                        fields[fieldName] = method(fieldValue)
                    }
                } 
            }
        }
        return fields
    }

    recordCredentials(request){
        return { ...this.fromRequest(request) }
    }
}


class BasicAuth extends Auth{

    alg = 'sha512'
    method = 'Basic'

    credentialCategories = {
        fromRequest: ['email', 'phone', 'password'],
        decode: { 
            base64: ['email', 'phone', 'password']
        }
    }


    decryptAuth(authStr){
        authStr = super.decryptAuth(authStr)
        const [id, password] = authStr.split(":").map(factor => Base64.decode(factor))

        if (!id || !password){
            throw statement(reprState.auth_data_dont_received)
        }
        return [id, password]
    }

    async createEncrypted(initModel){
        let model = initModel
        
        while(true){

            try{
                model['salt'] = this.generateSalt()
                model['password'] = await this.encrypt(
                    model.email, model.password, model.salt
                )
                return await dao.createUser(model)
            }
            catch (error){
                if (error instanceof dao.UniqueConstraintError){
                    var fields = Object.keys(error.fields)
                    if (fields.includes('email') || fields.includes('phone')){
                        throw statement(
                            reprState.conflict, 
                            'User exist already with this credentials'
                        )
                    }
                    continue
                }
                if (
                    error instanceof dao.DatabaseError || 
                    error instanceof dao.ValidationError
                ){ 
                    throw statement(reprState.bad_data, error.message)
                }
                else {
                    break
                }  
            }
        }
    }

    async recordCredentials(request){
        var model = super.recordCredentials(request)
        const user = await this.createEncrypted(model)
        return serializers.BasicAuthResponseSerializer.serialize(user)
    }

    async encrypt(id, password, salt=''){
        const NUMBER_ITERATIONS = 1000
        const KEY_LENGTH = 256 //* in bytes
        return new Promise (
            (resolve, reject) => { 
                crypto.pbkdf2(
                    `${id}:${password}`, 
                    salt, 
                    NUMBER_ITERATIONS, 
                    KEY_LENGTH, 
                    this.alg, 
                    (error, token) => {
                        if (error){
                            reject(error)
                        }
                        else {
                            resolve(token ? token.toString('hex') : null)
                        }
                    }
                )
            }
        )
    }

    async verify(authData){
        const [id, password] = this.decryptAuth(authData)
        const user = await dao.getUser(id)

        try {
            assert.ok(user)
        }
        catch (error){
            throw statement(reprState.user_not_found)
        }
        try {
            assert.equal(await this.encrypt(user.email, password, user.salt), user.password)
        }
        catch (error) { 
            throw statement(reprState.wrong_credentials)
        }
        return [id, password]
    }
}

class JWTAuth extends Auth{

    alg = 'HS512'
    method = 'Bearer'

    async decryptAuth(authStr){ 
        authStr = super.decryptAuth(authStr)
        const token = await this.verify(authStr, salt=config.SECRET_KEY)
        return token
    }

    //`encrypting` must be [id, password] as Array or 
    // encrypted jwt token as string:
    encrypt(encrypting, salt=''){

        return jwt.sign(encrypting, salt, { algorithm: this.alg })
    }

    async expirePreviousTokenIds(tokenIds, decrypt=false, findRelated=false){
        const related = []
        if (decrypt){
            tokenIds = await Promise.all(tokenIds.map(async (token) => { return await this.decryptAuth(token) }))
        }

        if (findRelated){
            for (let token of tokenIds){
                var tokenInstance = await dao.getJWTToken(token)
                related.push(tokenInstance.refreshToken || tokenInstance.that_refreshes)
            }
        }

        await dao.expirePreviousTokens([...tokenIds, ...related])
    }

    async verify(authStr, salt=null, checkEncryptedInstance=false){
        var token = authStr
        var verified
        var jwtToken

        if (!salt){
            token = await this.decryptAuth(authStr)
            jwtToken = await dao.getJWTToken(token)
            salt = jwtToken.salt
        }
        
        try{
            
            verified = jwt.verify(token, salt, { algorithm: this.alg })
        }
        catch(error){
            throw statement(reprState.token_not_provided)
        }
        if (checkEncryptedInstance){

            try{
                assert.ok(jwtToken)
            }
            catch (error) { 
                throw statement(reprState.token_not_found)
            }

            try {
                assert.ok(!jwtToken.expired) 
            }
            catch (error) { 
                throw statement(reprState.token_expired)
            }

            if (
                new Date(jwtToken.createdAt).valueOf() + config.JWT_TOKEN_EXPIRES_IN < Date.now() 
                && jwtToken.refreshToken
            ) { 
                throw statement(reprState.token_expired)
            }
            
            if (verified.refresh){
                await this.expirePreviousTokenIds([
                    jwtToken.token, 
                    jwtToken.that_refreshes
                ])
            }
        }
        if (jwtToken && jwtToken.that_refreshes){
            verified.refresh = true
        }
        return verified
    }

    async createEncrypted(initModel){
        var model = Object.assign({}, initModel)
        const userId = model.user_id
        delete model.user_id
        const refresh = Boolean(model.that_refreshes)
        while(true){
            try{
                model['salt'] = this.generateSalt()
                model['token'] = this.encrypt(
                    { 
                        id: userId,
                        refresh: refresh
                    }, 
                    model.salt
                )
                return await dao.createJWTToken(model)
            }
            catch (error){
                if (error instanceof dao.UniqueConstraintError){
                    continue
                }
                break
            }
        }
    }

    async recordCredentials(request){
        var model = super.recordCredentials(request)
        const userId = this.decodeBase64(request.userId)
        const ip = requestIp.getClientIp(request)
        const info = request.headers['user-agent']
        const userAgentId = await dao.getUserAgentId(info, ip, userId)

        model.user_id = userId
        model['user_agent_id'] = userAgentId
        const token = await this.createEncrypted(model)
        model['that_refreshes'] = token.token
        const refreshToken = await this.createEncrypted(model)

        return {
            token: this.encrypt(token.token, config.SECRET_KEY),
            refreshToken: this.encrypt(refreshToken.token, config.SECRET_KEY),
            createdAt: token.createdAt
        }
    }
}

const basicAuth = new BasicAuth()
const jwtAuth = new JWTAuth()

module.exports = {
    basicAuth,
    jwtAuth
}