const db = require('../../db/models/index')
const { ListSerializer, Serializer } = require('./serializer')
const { 
    FileResponse,
    FileUpdate,
    FileUpload,
    BasicAuthResponse,
} = require('./schemes')



const FileResponseSerializer = new Serializer(db.FileDescriptor, FileResponse)
const FileListSerializer = new ListSerializer(FileResponseSerializer)
const FileUpdateSerializer = new Serializer(db.FileDescriptor, FileUpdate)
const FileUploadSerializer = new Serializer(db.FileDescriptor, FileUpload)
const BasicAuthResponseSerializer = new Serializer(db.User, BasicAuthResponse)



module.exports = {
    FileResponseSerializer,
    FileUpdateSerializer,
    FileUploadSerializer,
    FileListSerializer,
    BasicAuthResponseSerializer
}