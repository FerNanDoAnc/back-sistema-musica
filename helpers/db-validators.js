const Role = require('../models/role');
const { Usuario, Repertorio, Cancion } = require('../models');

const esRoleValido = async(rol = '') => {

    const existeRol = await Role.findOne({ rol });
    if ( !existeRol&& rol.required==false ) {
        throw new Error(`El rol ${ rol } no está registrado en la BD`);
    }
}

const emailExiste = async( correo = '' ) => {

    // Verificar si el correo existe
    const existeEmail = await Usuario.findOne({ correo });
    if ( existeEmail ) {
        // Correo ya registrado
        throw new Error(`Correo no valido o ya ha sido registrado`);
    }
}

const existeUsuarioPorId = async( id ) => {

    // Verificar si el correo existe
    const existeUsuario = await Usuario.findById(id);
    if ( !existeUsuario ) {
        throw new Error(`El id no existe ${ id }`);
    }
}
/**
 * Categorias
 */
 const existeRepertorioPorId = async( id ) => {

    // Verificar si el correo existe
    const existeRepertorio = await Repertorio.findById(id);
    if ( !existeRepertorio ) {
        throw new Error(`El id no existe ${ id }`);
    }
}

/**
 * Productos
 */
const existeCancionPorId = async( id ) => {

    // Verificar si el correo existe
    const existeCancion = await Cancion.findById(id);
    if ( !existeCancion ) {
        throw new Error(`El id no existe ${ id }`);
    }
}


module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorId,
    existeRepertorioPorId,
    existeCancionPorId
}

