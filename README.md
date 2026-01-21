

# API

<h4>Prefix: /api - for all endpoints<h4>

## Service `Auth`

**Get the user id**


<code style="color : green">GET</code> /info 

*headers*:

Authorization Bearer `<JWT Token>`

Response HTTP Status 200:

JSON:

```json
{
    "id": `<number>`
}
```

**Logout from service**

<code style="color : green">GET</code> /logout 

*headers*:

Authorization Bearer <JWT Token>

Response HTTP Status 200:

**Log-in**

<code style="color : olive">POST</code> /signin 

*headers*:

Authorization Basic <Base64 Encoded id:password>

Response HTTP Status 201:

JSON: 

```json
{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}
```

**Refresh JWT token**

<code style="color : olive">POST</code> /signin/new_token 

*headers*:

Authorization Bearer <JWT Token>

Response HTTP Status 201:

JSON: 

```json
{
    "token": <Encrypted JWT Token>,
    "refreshToken": <Encrypted JWT Token>,
    "createdAt": <Date ISO>
}
```

**Register a new account**

<code style="color : olive">POST</code> /signup 

Request

*body*:

as JSON: 

```json
{
    "email": <Base64 encoded string>
    "phone": <Base64 encoded string>
    "password": <Base64 encoded string>
}
```

Response HTTP Status 201:

JSON 

```json
{
    "id": <number>
}
```

## Service `File`

<h4>Prefix: /file<h4>

*headers for all `file` endpoints*:

`Authorization Bearer <JWT Token>`

### File endpoinsts:

**Get info of all your files**

<code style="color : green">GET</code> /list 

Response HTTP Status 200:

JSON: 

```json
{
    "items": [
        {
            "id": <string>,
            "name": <string>,
            "extension": <string>,
            "mime_type": <string>,
            "size": <string>,
            "user_id": <number>,
            "upload_at": <Date ISO>,
            "url": <string>
        },
        ...
    ],
    "offset": "<number>, default 0",
    "limit": <number>, default 10,
    "total": <number>
}
```

**Get a file info by id**

<code style="color : green">GET</code> /:id 

Request

*Path params*:

id: `<number>`

Response HTTP Status 200:

JSON

```json
{
    "id": <string>,
    "name": <string>,
    "extension": <string>,
    "mime_type": <string>,
    "size": <string>,
    "user_id": <number>,
    "upload_at": <Date ISO>,
    "url": <string>
}
```

**Download file by id**

<code style="color : green">GET</code> /download/:id 

Request

*Path params*:

id: `<number>`

Response HTTP Status 200

**Delete the file**

<code style="color : purple">DELETE</code> /delete/:id

Response HTTP Status 200:

JSON

```json

{
    "message": "Delete success",
    "detail": "File id: <number>"
}

```

**Upload a new file**

<code style="color : olive">POST</code> /upload 

Request

*body*:

body.file: Buffer

Response HTTP Status 201:

JSON 

```json

{
    "message": "Success",
    "result": {
        "id": <string>,
        "name": <string>,
        "extension": <string>,
        "mime_type": <string>,
        "size": <string>,
        "user_id": <number>,
        "upload_at": <Date ISO>,
        "url": <string>
    }
}
```

**Update the file or create a new file (if such file with this `id` is not exist)**

<code style="color : blue">PUT</code> /update/:id 

Request

*body*:

body.file: Buffer

Response HTTP Status 200 (if file exist):

JSON

```json
{
    "message": "Success. File with id=<number> was created."
}
```


Response HTTP Status 201 (if file not exist):

JSON

```json 
{
    "message": "Success. File with id=<number> was updated."
}
```

## Possible HTTP Error Responses as JSON:

**Bad data**

Status code: 400

### Endpoint list:

* Register a new account
* Upload a new file
* Update the file or create a new file


```json
{
    "message": "Bad data",
    "detail": "Validation Error: Validation is on <fieldname> failed"
}
```




### Get a file info by id

**Doesn't exist**

Occur at the file request and if this file not exist anymore

Status code: 404

```json
{
    "message": "Resource doesn\'t exist",
    "detail": "Requested file with id=<number> doesn't exist anymore"
}
```

### Log-in

**User not found**

No user with this token assocoated

Status code: 401

```json
{
    "message": "User wasn\'t found",
    "detail": null
}
```

**Wrong credentials**

Incorrect token or unappropriate user credentials

Status code: 403

```json
{
    "message": "Wrong credentials",
    "detail": null
}
```

### Refresh JWT token

**Unsupported token**

If user use refreshToken to authorize at protected endpoints excluding `/signin/new_token` and
vice versa if temporary token used to authoriza at `/signin/new_token` for self-refresh

Status code 401

```json
{
    "message": "Unsupported token",
    "detail": null
}
```

### Register a new account


**Bad data**

Status code: 400

```json
{
    "message": "Bad data",
    "detail": "Validation Error: Validation is on <fieldname> failed"
}
```

**Conflict**

Staus code 409

```json
{
    "message": "Resource is exist. Conflict. Try with another id",
    "detail": "User exist already with this credentials"
}
```

### Get a file info by id

You try to access not your owned  file

Status code 403

**Not enought rights**

```json
{
    "message": "Not enought rights",
    "detail":" You don\'t have permissions for this action"
}
```

**Doesn't exist**

Status code 404

```json
{
    "message": "Resource doesn\'t exist",
    "detail": "File doesn\'t exist with id=<number>"
}
```

### Delete the file

**Fail to delete**

Occur if file is blocked by superuser and/or have highest access level.

Status code: 400

```json
{ 
    "message": "Fail to delete",
    "detail": "Fail to delete file with this id=<number>"
}
```

**Doesn't exist**

Occur at the file request and if this file not exist anymore

Status code: 404

```json
{
    "message": "Resource doesn\'t exist",
    "detail": "Requested file with id=<number> doesn't exist anymore"
}
```

### Upload a new file





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
    }