# Serializer

This is an documentation with examples of code to define your own serializers via
`serializer.js` module.

Able to work with sequelize instances v. 7 instanced on extended Model class od @sequelize/core. 
Supporting instances based on rest of all versions of sequelize or current in the case of instances from models 
which were defined as `sequelize.define` is unknown.

## Approach

My serializer based on construction of two components:

1) Scheme as Object, defining serialization rules, how and which keys should be included in final  Object.

2) Sequelize model class. This is help to build the final result. As a source of defing field properties to
make resulting object with fieldset which are defined by an user in scheme (1).



## Usage

### Scheme definition.

#### Properties:

* `excludes`, `includes` - that you want include and exclude respectively.

<br> You can specify entire group of fields as:

`@all` <br> - will be all fields
`@pk` <br> - will be primary keys
`@virtual` <br> - will be fields of model with type `VIRTUAL`

* `as` - an object structure, describing as value will be setted in result serialized object

This is definitely mapping as set of fields which values are serialization rules in it and value 
sources also.
If you want to map your field name as an another name in your result object you should 
specify this new name as a string. 

Otherwise if you want to re-define your field value as computed field you should put in its value
special structure:

{
    method?: <function>,
    default?: <any>,
    as?: <string>
}

* `method` - a function with parameters or nullary. Here you should provide only such name of arguments which are exist in your serializer class properties. As a rule it is instance, because my serialzer doesn't support something else.
* `default` - default value for your field, supports any type besides function.
* `as` - if you want specify field name that's differ from instance.


Next property is only experemental:

* `assoc` - an object structure for serialize a nested object or an array. Also it is a mapping object that describes
how serialzie nested:

{
    how: <Serializer> | scheme<Object>,
    scalar: <string>
}

* `how` You can provide serializer class to serialzie nested objects or specify a scheme which will be applied to
the same serializer class instance through `this`.

* `scalar` If you just only get value from nested object by this specified field name.

## Usage


If you need to prepare model with required data to write it to the database
using sequelize model.

Assume, you have your defined model `FileDescriptor`:

```javascript


//models.js: 

const { Sequelize, DataTypes, Deferrable, Model } = require('@sequelize/core')
const { MySqlDialect } = require('@sequelize/mysql')

const config = require('../../config');

const sequelize = new Sequelize(
  {
    dialect: MySqlDialect,
    database: config.MYSQL_DATABASE,
    user: config.MYSQL_USER,
    password: null,
    host: config.MYSQL_DB_HOST,
    port: config.MYSQL_PORT
  }
)

class FileDescriptor extends Model {}
FileDescriptor.init({
      id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
      },
      name: {
            type: DataTypes.STRING(255),
            allowNull: false
      },
      extension: {
            type: DataTypes.STRING(10)
      },
      mime_type: {
            type: DataTypes.STRING(76),
            allowNull: false,
            validate: {
              is: /^\S+\/\S+$/
            }
      },
      size: {
            type: DataTypes.BIGINT,
            allowNull: false
      },
      user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: false,
            references: {
                      model: User,
                      key: 'id',
                      deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
      },
      upload_at: {
            type: DataTypes.DATE,
            allowNull: false
      },
      url: {
        type: DataTypes.VIRTUAL,
        get(){
          return `file/${this.id}`
        }
      }
    },
    { 
      sequelize,
      modelName: 'FileDescriptor',
      createdAt: 'upload_at'
    }
)

module.exports = {
    FileDescriptor
}
```

Your server retrieves some file data at the endpoint `/file/upload`.
This data would be like as:

```json

{
    "fieldname": "file",
    "originalname": "top german tags.txt",
    "encoding": "utf-8",
    "mimetype": "plain/text",
    "size": "59",
    "destination": "code/uploads/6",
    "filename": "top german tags.txt",
    "path": "code/uploads/6/top german tags.txt",
    "buffer": "<blob>"
}
```

Then if you need that data after file upload to be processed successfully 
througt sequelize model, your data should be like as:

```json

{
    "mime_type": "plain/text",
    "size": "59",
    "name": "top german tags.txt",
    "extension": "txt",
    "user_id": "6"
}
```


This can be done by `Serializer`. To initialize it you should prepare this scheme as:

```javascript

//schemes.js:

const FileUpload = {
    exclude: [
        'fieldname',
        'originalname',
        'encoding',
        'destination',
        'path'
    ],

    as: {
        filename: 'name',
        mimetype: 'mime_type',
        extension: {
            method: (instance) => path.extname(instance.filename) 
        },
        user_id: {
            method: (instance) => parseInt(instance.destination.split('/').at(-1))
        }
    }
}
```

As you can see, you have to add some fieldset to exclude, define methods to
compute extra fields (`extension`, `user_id`), and map fields to rename filename and
mimetype for database insert transaction be correct.

Now you can define serializer class singletone as:

```javascript
const { Serializer } = require('./serializer')
const { FileDescriptor }  = require('../../db/models')
const { FileUpload } = require('./schemes')

const fileUploadSerializer = new Serializer(FileDescriptor, FileUopload)

module.exports = {
    fileUploadSerializer
}
```

Now is the time to make our finite model for create operation:

```javascript
const serializer = require('./serialize/serializers')

//...

const fileData = request.body.file
serializer.fileUploadSerializer.serialize(fileData)
```