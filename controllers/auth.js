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
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

        // SI el usuario está activo
        if ( !usuario.estado ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - estado: false'
            });
        }

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.json({
            ok:true,
            usuario,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
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
    console.log(req)
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
            msg: 'Error!! al revaliddar token'
        });
    }   


    // const {_id}=req.usuario;

    // // Leer la bd para obetener el email
    // const dbUser=await Usuario.findById(_id);

    // const token=await generarJWT(_id, dbUser.nombre);
    // return res.json({
    //     ok:true,
    //     message: 'Token Revalidado',
    //     _id,
    //     nombre:dbUser.nombre,
    //     correo:dbUser.correo,
    //     rol:dbUser.rol,
    //     token
    // });
}


module.exports = {
    login,
    googleSignin,
    revalidarToken
}
