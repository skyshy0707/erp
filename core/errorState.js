const { HttpError } = require('http-json-errors')

//const { response } = require('express')

const reprState = {
    bad_data: (detail=null) => { return {
        code: 400, 
        message: 'Bad data',
        detail: detail
    }},
    fail_to_delete: (detail=null) => { return {
        code: 400, 
        message: 'Fail to delete',
        detail: detail
    }},
    fail_to_download: (detail=null) => { return {
        code: 400, 
        message: 'Fail to download',
        detail: detail
    }},
    fail_to_upload: (detail=null) => { return {
        code: 400, 
        message: 'Fail to upload',
        detail: detail
    }},
    auth_data_dont_received: (detail=null) => { return {
        code: 401, 
        message: 'Auth data don\'t received',
        detail: detail
    }},
    token_expired: (detail=null) => { return {
        code: 401, 
        message: 'Token expired',
        detail: detail
    }},
    token_invalid: (detail=null) => { return {
        code: 401, 
        message: 'Token invalid',
        detail: detail
    }},
    token_not_found: (detail=null) => { return {
        code: 401, 
        message: 'Token wasn\'t found',
        detail: detail
    }},
    token_not_provided: (detail=null) => { return {
        code: 401, 
        message: 'Token wasn\'t provided or invalid',
        detail: detail
    }},
    unappropriate_method_auth: (detail=null) => { return {
        code: 401, 
        message: 'Inappropriate auth method used',
        detail: detail
    }},
    user_not_found: (detail=null) => { return {
        code: 401, 
        message: 'User wasn\'t found',
        detail: detail
    }},
    unsupported_token: (detail=null) => { return {
        code: 401, 
        message: 'Unsupported token',
        detail: detail
    }},
    not_enough_rights: (detail=null) => { return {
        code: 403, 
        message: 'Not enought rights',
        detail: detail
    }},
    wrong_credentials: (detail=null) => { return {
        code: 403, 
        message: 'Wrong credentials',
        detail: detail
    }},
    doesnt_exist: (detail=null) => { return {
        code: 404, 
        message: 'Resource doesn\'t exist',
        detail: detail
    }},
    conflict: (detail=null) => { return {
        code: 409, 
        message: 'Resource is exist. Conflict. Try with another id',
        detail: detail
    }}
}


function statement(reprState, detail=null){

    if (typeof reprState == 'function'){
        reprState = reprState(detail)
    }
  
    throw new HttpError(
        reprState.code, {
            message: reprState.message,
            detail: reprState.detail || detail
        }
    )
}

module.exports = {
    reprState,
    statement

}