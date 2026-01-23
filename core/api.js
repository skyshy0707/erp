const cors = require('cors')
const express = require('express')

const crud = require('./crud')
const { 
  basicAuth, 
  bearerAuth, 
} = require('./middleware/authorization')
const { uploadStorage } = require('./middleware/filesystem')
const handle = require('./middleware/handlers')

const app = express()
const authentification = express.Router()
const service = express.Router()

const corsOptions = { 
  origin: [
    "*"
  ],
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Content-Length',
    'User-Agent',
    'Authorization',
    'Host',
    'Accept',
    'Accept-Encoding',
    'Connection',
    'Cache-Control',
    'Postman-Token'
  ],
  methods: [
    "*"
  ]
}

app.use(cors(corsOptions))
app.use(express.json())

authentification.get('/info', bearerAuth, (request, response) => {
  return crud.info(request, response)
})

authentification.get('/logout', bearerAuth, async (request, response) => {
  return await crud.logout(request, response)
})

authentification.post('/signin', basicAuth, async (request, response) => {
  return await crud.signin(request, response)
})

authentification.post('/signin/new_token', bearerAuth, async (request, response) => {
  return await crud.newToken(request, response)
})

authentification.post('/signup', async (request, response) => {
  return await crud.signup(request, response)
})

service.get('/list', async (request, response) => {
  return await crud.fileList(request, response)
})

service.get('/:id', async (request, response) => {
  return await crud.file(request, response)
})

service.get('/download/:id', async (request, response) => {
  return await crud.fileDownload(request, response)
})

service.delete('/delete/:id', async (request, response, next) => {
  return await crud.fileDelete(request, response)
})

service.post('/upload', uploadStorage, async (request, response, next) => {
  console.log(`contenttype: ${request.headers['content-type']}`)
  return await crud.fileUpload(request, response)
}, handle.errorHandler)

service.put('/update/:id', uploadStorage, async (request, response, next) => {
  return await crud.fileUpdate(request, response)
}, handle.errorHandler)


app.use("/api", authentification)
app.use(bearerAuth)
app.use("/api/file", service)


app.listen(8000, () => {
  console.log("Now I'm ready to take requests")
})