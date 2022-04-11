const { response, request } = require('express');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');

const { generarJWT } = require('../helpers/generar-jwt');

const usuariosGet = async(req = request, res = response) => {

    const { limite = 100, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, usuarios ] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.status(200).json({
        ok:true,
        total,
        usuarios
    });
}
// 
const usuarioGetPorId = async(req, res = response) => {
    const { id } = req.params;
    
    const usuario = await Usuario.findById( id );
    res.status(200).json({
        ok:true,
        // total,
        usuario
    });
}

// Crear Usuarios
const usuariosPost = async(req, res = response) => {
    
    const { nombre, correo, password, rol } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );

    // Generar el JWT
    const token = await generarJWT( usuario.id );
    
    // Guardar en BD
    await usuario.save();

    res.status(200).json({
        ok:true,
        usuario,
        nombre,
        correo,
        rol,
        token
    });
}

const usuariosPut = async(req, res = response) => {

    const { id } = req.params;
    // Resto es todo lo que permite editar
    const { _id, password, google, ...resto } = req.body;
    
    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }
    

    const usuario = await Usuario.findByIdAndUpdate( id, resto );
    
    res.status(200).json({
        ok:true,
        usuario,
        msg: 'Usuario actualizado'
    });
}

const usuariosPatch = (req, res = response) => {
    res.json({
        ok:true,
        msg: 'patch API - usuariosPatch'
    });
}

const usuariosDelete = async(req, res = response) => {

    const { id } = req.params;
    const usuario = await Usuario.findByIdAndUpdate( id, { estado: false } );

    
    res.json({
        ok:true,
        usuario});
}




module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosPatch,
    usuariosDelete,
    usuarioGetPorId
}