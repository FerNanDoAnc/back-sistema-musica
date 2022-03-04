const { response } = require('express');
const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');

const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify');


const login = async(req, res = response) => {

    const { correo, password } = req.body;

    try {
      
        // Verificar si el email existe
        const usuario = await Usuario.findOne({ correo });
        if ( !usuario ) {
            return res.status(400).json({
                ok:false,
                msg: 'Usuario y/o contraseña incorrectos'
            });
        }

        // SI el usuario está activo
        if ( !usuario.estado ) {
            return res.status(400).json({
                ok:false,
                msg: 'Cuenta inactiva'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                ok:false,
                msg: 'Usuario y/o contraseña incorrectos'
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        // respuesta para el login
        res.status(200).json({
            ok:true,
            usuario,
            nombre:usuario.nombre,
            token,
            msg: 'Sesión Iniciada'
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok:false,
            msg: 'Error, contacte al administrador'
        });
    }   

}


const googleSignin = async(req, res = response) => {

    const { id_token } = req.body;
    
    try {
        const { correo, nombre, img } = await googleVerify( id_token );

        let usuario = await Usuario.findOne({ correo });

        if ( !usuario ) {
            // Tengo que crearlo
            const data = {
                ok:true,
                nombre,
                correo,
                password: ':P',
                img,
                google: true
            };

            usuario = new Usuario( data );
            await usuario.save();
        }

        // Si el usuario en DB
        if ( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Hable con el administrador, usuario bloqueado'
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );
        
        res.json({
            usuario,
            token
        });
        
    } catch (error) {

        res.status(400).json({
            msg: 'Token de Google no es válido'
        })

    }



}

const revalidarToken= async (req, res=response) => {

    const { _id } = req.usuario;
    try {
      
        // Verificar si el email existe
        const dbusuario = await Usuario.findById({ _id });
        if ( dbusuario ) {

            const token=await generarJWT(_id,dbusuario);

            return res.status(200).json({
                ok:true,
                message: 'Token Revalidado',
                _id,
                nombre:dbusuario.nombre,
                correo:dbusuario.correo,
                rol:dbusuario.rol,
                token
            });
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            ok:false,
            msg: 'Error!! al revalidar token'
        });
    }   

}


module.exports = {
    login,
    googleSignin,
    revalidarToken
}
