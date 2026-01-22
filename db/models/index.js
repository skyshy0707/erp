'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes, Deferrable, Model } = require('@sequelize/core')
const { MySqlDialect } = require('@sequelize/mysql')

const basename = path.basename(__filename);
const config = require('../../config');
const db = {};


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

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });


class Device extends Model {}
Device.init(
  {
    id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    ip: {
            type: DataTypes.STRING(50),
            unique: 'user_device'
    },
    info: {
            type: DataTypes.STRING(512),
            unique: 'user_device'
    }
  },
  { 
    sequelize,
    modelName: 'Device',
    uniqueKeys: {
      user_device: {
        fields: ['ip', 'info']
      }
    }
  }
)


class User extends Model {}
User.init(
  {
    id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
    },
    email: {
            type: DataTypes.STRING(285),
            allowNull: false,
            unique: true,
            validate: {
              is: /^\S+@\S+\.\S+$/
            }
    },
    phone: {
            type: DataTypes.STRING(13),
            allowNull: false,
            unique: true,
            validate: {
              is: /^\+\d{2,13}$/
            }
    },
    password: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: true
    },
    salt: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: true
    }
  },
  { 
    sequelize,
    modelName: 'User'
  }
)

class UserAgent extends Model {}
UserAgent.init(
  {
    id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
    },
    user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: 'who_use',
          references: {
                    model: User,
                    key: 'id',
                    deferrable: Deferrable.INITIALLY_IMMEDIATE
          }
    },
    device_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: 'who_use',
          references: {
                    model: Device,
                    key: 'id',
                    deferravble: Deferrable.INITIALLY_IMMEDIATE
          }
    }
  },
  { 
    sequelize,
    modelName: 'UserAgent',
    uniqueKeys: {
      who_use: {
        fields: ['user_id', 'device_id']
      }
    }
  }
)

class JWTToken extends Model {}
JWTToken.init(
  {
    id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
    },
    token: {
          type: DataTypes.STRING(512),
          allowNull: false,
          unique: true
    },
    that_refreshes: {
          type: DataTypes.STRING(512),
          references: {
                    tableName: 'JWTTokens',
                    key: 'token',
                    deferravble: Deferrable.INITIALLY_IMMEDIATE
          }
    },
    salt: {
          type: DataTypes.STRING(512),
          allowNull: false,
          unique: true
    },
    user_agent_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false,
          references: {
                    model: UserAgent,
                    key: 'id',
                    deferravble: Deferrable.INITIALLY_IMMEDIATE
          }
    },
    expired: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
    }
  },
  { 
    sequelize,
    modelName: 'JWTToken'
  }
)

Device.hasMany(UserAgent, {
  foreignKey: 'device_id', sourceKey: 'id'
})

User.hasMany(UserAgent, {
  foreignKey: 'user_id', sourceKey: 'id'
})

UserAgent.belongsTo(Device, {
  foreignKey: 'device_id', targetKey: 'id'
})

UserAgent.belongsTo(User, {
  foreignKey: 'user_id', targetKey: 'id'
})


JWTToken.belongsTo(JWTToken, {
  foreignKey: 'that_refreshes', targetKey: 'token', 
  as: 'refreshToken'
})

UserAgent.hasMany(JWTToken, {
  foreignKey: 'user_agent_id', sourceKey: 'id'
})

JWTToken.belongsTo(UserAgent, {
  foreignKey: 'user_agent_id', targetKey: 'id'
})


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

User.hasMany(FileDescriptor, {
  foreignKey: 'user_id', sourceKey: 'id'
})

FileDescriptor.belongsTo(User, {
  foreignKey: 'user_id', targetKey: 'id'
})

db.Device = Device
db.User = User
db.UserAgent = UserAgent
db.JWTToken = JWTToken
db.FileDescriptor = FileDescriptor

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
