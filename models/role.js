const { Schema, model } = require('mongoose');

const RoleSchema = Schema({
    rol: {
        type: String,
        required: [false, 'El rol no es obligatorio']
    }
});


module.exports = model( 'Role', RoleSchema );
