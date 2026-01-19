const { 
    ConnectionAcquireTimeoutError,
    ConnectionRefusedError,
    DatabaseError,
    UniqueConstraintError
} = require('sequelize')

const db = require('./models/index')

const initialize = () => { 
    return new Promise((resolve, reject) => {
        
        db.sequelize.authenticate().then(
            () => {
                console.log("Autheticate was success")

                try{
                    db.sequelize.sync().then(
                        () => {
                            console.log("DB was synchronized")
                        }
                    )
                    resolve()
                }
                catch(error){
                    reject(error)
                }
            }
        ).catch((error) => {
            console.log(`Невозможно установить соединение. Details: ${error}`)
        })
    })   
}

initialize()