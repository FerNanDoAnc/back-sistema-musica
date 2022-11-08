const { Schema, model } = require('mongoose');

const RepertorioSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
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
            }
        }
    ],
    img: { 
        type: String,
        default: 'https://res.cloudinary.com/da0vmaada/image/upload/v1667933926/Profile-default/logo-repertorio_nd79pq.webp'
    },
    favorito: {
        type: Boolean,
        default: false,
    }
});


RepertorioSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject();
    return data;
}


module.exports = model( 'Repertorio', RepertorioSchema );
