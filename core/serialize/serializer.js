//const Serializer = require('sequelize-to-json')
const getParams = require('get-function-params')

const { DataTypes } = require('@sequelize/core')

class ListSerializer{

    constructor(serialzier){
        this.serializer = serialzier
    }

    serialize(items){
        const objects = []

        for (let item of items){
            objects.push(
                this.serializer.serialize(item)
            )
        }
        return { items: objects }
    }
}

class Serializer{


    reservedWords = [
        "@all", "@pk"
    ]

    reservedParams = [
        'instance', 'model'
    ]

    constructor(model, scheme){
        this.model = model
        this.scheme = scheme
    }

    //isNewRecord,_schema,_schemaDelimiter,attributes,include,raw,silent,model (_scope, _scopeNames)
    serialize(instance){
        const data = instance.dataValues ? instance.dataValues : instance
        console.log(`instance: ${Object.keys(instance)}`)
        var includes = new Set(this.scheme.include)
        var excludes = new Set(this.scheme.exclude)
        const virtualExclude = excludes.delete("@virtual")
        if (instance.dataValues){
            console.log(`dvalues: ${Object.keys(instance.dataValues)}`)
            console.log(`options.attrs: ${Object.keys(instance._options)}`)
            var tj = instance.toJSON()
            console.log(`RAW: ${tj.url}, at instance: ${instance.url}`)
        }
        //this.model.modelDefinition.attributes

        /*const fieldset = new Set(Object.keys(this.model.modelDefinition.rawAttributes))

        console.log(`fieldset typeof: ${typeof(fieldset)}`)

        for (let f of fieldset){
            console.log(`field ${f} = ? ${fieldset[f]}`)
        }*/
    
        //const virtualFieldSet = fieldset.difference(new Set(Object.keys(data)))


        const fields = this.model.modelDefinition.rawAttributes
        for (let field of Object.keys(fields)){
            if (virtualExclude){
                break
            }

            var fieldDesc = fields[field]

            if (fieldDesc.type.constructor.name == DataTypes.VIRTUAL.name){
                data[field] = instance[field]
            }
            
        }

        /*for (let field of fieldset){
            if (!data.hasOwnProperty(field)){
                console.log(`virtial field ${field} = ${instance[field]}`)
                serialized[field] = instance[field]
            }
        }*/



        

        const pks = this.model.primaryKeyAttributes
        const rename = this.scheme.as || new Object()
        var serialized = new Object()
       
        const allIncludes = includes.delete("@all")
        const assoc = this.scheme.assoc || new Object()
        
    
        if (includes.delete("@pk")){
            includes = includes.union(new Set(pks))
        }

        for (let field of includes){
            if (data.hasOwnProperty(field)){
                serialized[field] = data[field]
            }
        }
        
        if (excludes.delete("@pk")){
            excludes = excludes.union(new Set(pks))
        }

        if (excludes.size || allIncludes){
            serialized = Object.assign({}, data)
        }

        for (let field of excludes){
            console.log(`Field ${field} will be deleted`)
            delete serialized[field]
        }


        for (let field of Object.keys(rename)){

            //old value:
            var fieldValue = serialized[field]


            var setAs = rename[field] 
            if (typeof(setAs) == 'object'){
                var source = setAs.method ? setAs.method : setAs.default
                

                if (typeof(source) == 'function'){
                    var applies = []
                    var params = getParams(source)

                    for (let p of Object.keys(params[0])){
                        console.log(`Param of computed function: ${p}=${params[0][p]}`)
                    }
                    
                    for (let signParam of params){
                        var paramName = signParam.param
                        console.log(`getting param ${paramName}`)
                        if (this.reservedParams.includes(paramName)){
                            console.log(`at this: ${this[paramName]}`)
                            applies.push(this[paramName] ? this.model : data)
                        }
                        else applies.push(signParam.default)
                    }
                    console.log(`applies: ${applies}`)

                    console.log(`filename: ${data.filename}`)
                    fieldValue = source.apply(null, applies)
                    applies.lenght = 0
                }
                else { fieldValue = source }
                setAs = field
            }
            delete serialized[field]
            serialized[setAs] = fieldValue
        }

        for (let field in Object.keys(assoc)){
            if (serialized.hasOwnProperty(field)){
                var serializeAssoc = assoc[field]
                var assocData = serialized[field] 
                if (serializeAssoc.scalar){
                    serialized[field] = assocData[serializeAssoc.scalar]
                    continue
                }
                var howTo = serializeAssoc.how 
                var assocSerializer = howTo instanceof Serializer ? howTo : new Serializer(this.model, howTo)

                if (assocData instanceof Array && !(howTo instanceof ListSerializer)){
                    assocSerializer = new ListSerializer(assocSerializer)
                }
                serialized[field] = assocSerializer.serialize(assocData)
            }
        }

        return serialized
    }
}

module.exports = { Serializer, ListSerializer }