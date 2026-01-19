const { HttpError } = require('http-json-errors')

//const { response } = require('express')

const reprState = {
    bad_data: (detail=null) => { return {
        code: 400, 
        body: {
            message: 'Bad data',
            detail: detail
        }
    }},
    fail_to_delete: (detail=null) => { return {
        code: 400, 
        body: { 
            message: 'Fail to delete',
            detail: detail
        }
    }},
    fail_to_upload: (detail=null) => { return {
        code: 400, 
        body: { 
            message: 'Fail to upload',
            detail: detail
        }
    }},
    auth_data_dont_received: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'Auth data don\'t received',
            detail: detail
        }
    }},
    token_expired: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'Token expired',
            detail: detail
        }
    }},
    token_invalid: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'Token invalid',
            detail: detail
        }
    }},
    token_not_found: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'Token wasn\'t found',
            detail: detail
        }
    }},
    token_not_provided: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'Token wasn\'t provided or invalid',
            detail: detail
        }
    }},
    unappropriate_method_auth: (detail=null) => { return {
        code: 401, 
        body: { 
            message: 'Inappropriate auth method used',
            detail: detail
        }
    }},
    user_not_found: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'User wasn\'t found',
            detail: detail
        }
    }},
    unsupported_token: (detail=null) => { return {
        code: 401, 
        body: {
            message: 'Unsupported token',
            detail: detail
        }
    }},
    not_enough_rights: (detail=null) => { return {
        code: 403, 
        body: {
            message: 'Not enought rights',
            detail: detail
        }
    }},
    wrong_credentials: (detail=null) => { return {
        code: 403, 
        body: {
            message: 'Wrong credentials',
            detail: detail
        }
    }},
    doesnt_exist: (detail=null) => { return {
        code: 404, 
        body: {
            message: 'Resource doesn\'t exist',
            detail: detail
        }
    }},
    conflict: (detail=null) => { return {
        code: 409, 
        body: {
            message: 'Resource is exist. Conflict. Try with another id',
            detail: detail
        }
    }}

}


function statement(reprState, detail=null){

    if (typeof reprState == 'function'){
        reprState = reprState(detail)
    }
  
    throw new HttpError(
        reprState.code, {
            message: reprState.body.message,
            detail: reprState.body.detail || detail
        }
    )
}

module.exports = {
    reprState,
    statement

}