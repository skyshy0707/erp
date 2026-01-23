# ERP Service

Service for storing and uploading files by users with registration and authorization based on
REST API architecture. This is the server part.

**Few specialities of this work:**

My authorization middleware produce extra-encrypted jwt bearer tokens for more high protection. This is significant if
 project uses cookies for storing user jwt token.

I use self-developed serializer[https://github.com/skyshy0707/erp/tree/master/core/serialize] which allow 
to get objects for instancing db models and helps to avoid code repeating. And the main it's can work with
`sequelize v.7` models based on `Model` class.


# API

<h4>Prefix: /api - for all endpoints<h4>

## Service `Auth`

**Get the user id**


<code style="color : green">GET</code> /info 

Request

headers:

&nbsp;&nbsp;&nbsp;Authorization: `Bearer <JWT Token>`

Response HTTP Status 200:

JSON:

```json
{
    "id": <number>
}
```

**Logout from service**

<code style="color : green">GET</code> /logout 

Request

headers:

&nbsp;&nbsp;&nbsp;Authorization: Bearer `<JWT Token>`

Response HTTP Status 200

**Log-in**

<code style="color : olive">POST</code> /signin 

Request

headers:

&nbsp;&nbsp;&nbsp;Authorization: Basic `<Base64 Encoded id:password>`*

&nbsp;&nbsp;&nbsp;\* where `id` - this is one of the your credentials from { `email`, `phone` }.
To signin you could use `email` or `phone` encoded in `base64` code

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

Request

headers:

&nbsp;&nbsp;&nbsp;Authorization: `Bearer <JWT Token>`

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

body:

&nbsp;&nbsp;&nbsp;as JSON: 

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

headers for all `file` endpoints:

&nbsp;&nbsp;&nbsp;Authorization: `Bearer <JWT Token>`

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
    "offset": <number>, default 0,
    "limit": <number>, default 10,
    "total": <number>
}
```

**Get a file info by id**

<code style="color : green">GET</code> /:id 

Request

Path params:

&nbsp;&nbsp;&nbsp;id: `<number>`

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

Path params:

&nbsp;&nbsp;&nbsp;id: `<number>`

Response HTTP Status 200

![file](https://www.vecteezy.com/vector-art/12688985-file-icon-3d-render)

**Delete the file**

<code style="color : purple">DELETE</code> /delete/:id

Request

Path params:

&nbsp;&nbsp;&nbsp;id: `<number>`

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

body:

&nbsp;&nbsp;&nbsp;body.file: Buffer

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

**Update the file or create a new file (if file with this `id` is not exist)**

<code style="color : blue">PUT</code> /update/:id 

Request

body:

&nbsp;&nbsp;body.file: Buffer

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

## Others possible HTTP Error Responses as JSON:

### Bad data

Status code: 400

#### Endpoint list:

* Register a new account
* Upload a new file
* Update the file or create a new file


```json
{
    "message": "Bad data",
    "detail": "Validation Error: Validation is on <fieldname> failed"
}
```

### Auth data don't received

Occurs if you set anything in Authorization header

Status code 401

#### Endpoint list:

All protect endpoints, required authorization header

```json
{
    "message": "Auth data don't received",
    "detail": null
}
```

### Token expired

Occurs when token was expired

Status code 401

#### Endpoint list:

All protect endpoints which require JWT-authorization

```json
{
    "message": "Token expired",
    "detail": null
}
```

### Token was't found

Occurs when token was retrieved but not found. Occurs rarely at this moment 
between authorization processing and when user have been deleted 

Status code 401

#### Endpoint list:

All protect endpoints which require JWT-authorization


```json
{
    "message": "Token wasn't found",
    "detail": null
}
```

### Token wasn't provided

Occurs when token wasn't provided in Authorization header or invalid

Status code 401

#### Endpoint list:

All protect endpoints which require JWT-authorization


```json
{
    "message": "Token wasn't provided or invalid",
    "detail": null
}
```

### Unappropriate auth method

Occurs when auth method is not correct for the current endpoint

Status code 401

#### Endpoint list:

All protect endpoints, required authorization header

```json
{ 
    "message": "Inappropriate auth method used",
    "detail": null
}
```

### Not enough rights

Occurs when user refers to the endpoint that return resource
which is own another user

Status code 403

#### Endpoint list:

All protect endpoints which require JWT-authorization

```json
{
    "message": "Not enought rights",
    "detail": null
}
```

## Endpoints with specific error representational status

### Get a file info by id

**Doesn't exist**

Occur at the file request and if this file not exist anymore

Status code: 404

```json
{
    "message": "Resource doesn't exist",
    "detail": "Requested file with id=<number> doesn't exist anymore"
}
```

### Log-in

**User not found**

No user with this token assocoated

Status code: 401

```json
{
    "message": "User wasn't found",
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

**Not enought rights**

Occurs when you try to access not your owned  file

Status code 403

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

### Download file by id

**Doesn't exist**

Status code 404

Occurs if file doesn't exist or was deleted.
This response returns also if you try to download not your own file

```json
{
    "message": "Resource doesn\'t exist",
    "detail": "File with id=<number> doesn\'t exist or was deleted"
}
```


Html only returns when file metadata was retrived, 
but file could be blocked or deleted by superuser

OR html only:

```html

<head>
    <meta charset="utf-8">
    <title>Error</title>
</head>

<body>
    <pre>Cannot GET /api/file/download/<number></pre>
</body>
```


### Delete the file

**Fail to delete**

Occurs if file is blocked by superuser and/or have highest access level

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

**Bad data**

Usually occurs if you upload file with too long name which is unsupported by server

Status code: 400

```json
{
    "message": "Bad data",
    "detail": "Validation Error: Validation is on name failed"
}
```

### Update the file or create a new file

**Bad data**

Usually occurs if you upload file with too long name which is unsupported by server

Status code: 400

```json
{
    "message": "Bad data",
    "detail": "Validation Error: Validation is on name failed"
}
```

## How to build

```bash
docker compose up -d --build
```