const path = require('node:path')

const env = process.env

module.exports = { 
    MYSQL_USER: 'root',
    MYSQL_ROOT_HOST: env.MYSQL_ROOT_HOST,
    MYSQL_DB_HOST: "database",
    MYSQL_PORT: 3306,
    MYSQL_DATABASE: env.MYSQL_DATABASE,
    SECRET_KEY: env.SECRET_KEY,
    JWT_TOKEN_EXPIRES_IN: 6 * 10**3, // 10 minutes in ms 
    FILE_UPLOAD_PATH: path.resolve(__dirname, './uploads')
} 