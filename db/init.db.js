const { 
    ConnectionAcquireTimeoutError,
    ConnectionRefusedError,
    DatabaseError,
    UniqueConstraintError
} = require('@sequelize/core')

const db = require('./models/index')


const delay = async () => new Promise(
    resolve => {
        console.log(`Next attemption in 6 seconds`)
        setTimeout(resolve, 6000)
    }
)

const initialize = async () => { 

    while (true){
        try{
            await db.sequelize.authenticate()
            console.log("Authentification was success")
            break
        }
        catch(error){
            console.log(`Can't to connect to mysql database server`)
            if (error instanceof ConnectionRefusedError){
                await delay()
                continue
            }
            break
        }
    }
    try{
        await db.sequelize.sync()
        console.log("Dbs were created")
    }
    catch(error){
        console.log(`Error was occured at sequelize synced datatables ${error}`)
    }
}

initialize()