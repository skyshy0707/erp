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

    serialize(instance){
        const data = instance.dataValues ? instance.dataValues : instance

        var includes = new Set(this.scheme.include)
        var excludes = new Set(this.scheme.exclude)
        const allIncludes = includes.delete("@all")
        const assoc = this.scheme.assoc || new Object()
        const fields = this.model.modelDefinition.rawAttributes
        const pks = this.model.primaryKeyAttributes
        const rename = this.scheme.as || new Object()
        var serialized = new Object()
        const virtualInclude = includes.delete("@virtual")
        const virtualExclude = excludes.delete("@virtual")

        for (let field of Object.keys(fields)){
            if (virtualExclude){
                break
            }
            var fieldDesc = fields[field]
            if (fieldDesc.type.constructor.name == DataTypes.VIRTUAL.name){
                data[field] = instance[field]
                if (virtualInclude){
                    serialized[field] = instance[field]
                }
            }
        }
    
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

                    for (let signParam of params){
                        var paramName = signParam.param
                        if (this.reservedParams.includes(paramName)){
                            applies.push(this[paramName] || data)
                        }
                        else applies.push(signParam.default)
                    }
                    fieldValue = source.apply(null, applies)
                    applies.lenght = 0
                }
                else { fieldValue = source }
                setAs = setAs.as ? setAs.as : field
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