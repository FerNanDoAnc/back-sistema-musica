const { Schema, model } = require('mongoose');

const RepertorioSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: false
    },
    estado: {
        type: Boolean,
        default: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        type: String,
    },
    integrantes: [
        { 
            correo:{ 
                type: String,
                required: false,
                unique: true
            }
        }
    ]
});


RepertorioSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Repertorio', RepertorioSchema );
