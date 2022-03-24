const { response } = require('express');
const { ObjectId } = require('mongoose').Types;

const { Usuario, Repertorio, Cancion } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'repertorios',
    'canciones',
    'roles'
];

const buscarUsuarios = async( termino = '', res = response ) => {

    const esMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( esMongoID ) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            ok: true,
            msg: 'Usuario encontrado',
            results: ( usuario ) ? [ usuario ] : []
        });
    }

    const regex = new RegExp( termino, 'i' );
    const usuarios = await Usuario.find({
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    });

    res.json({
        results: usuarios
    });

}

const buscarRepertorios = async( termino = '', res = response ) => {

    const esMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( esMongoID ) {
        const repertorio = await Repertorio.findById(termino);
        return res.json({
            ok: true,
            msg: 'Repertorio encontrado',
            results: ( repertorio ) ? [ repertorio ] : []
        });
    }

    const regex = new RegExp( termino, 'i' );
    const repertorios = await Repertorio.find({ nombre: regex, estado: true });

    res.status(200).json({
        ok: true,
        msg: 'Repertorios encontrados',
        results: repertorios
    });

}

const buscarCanciones = async( termino = '', res = response ) => {

    const esMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( esMongoID ) {
        const cancion = await Cancion.findById(termino)
                            .populate('repertorio','nombre');
        return res.json({
            ok: true,
            msg: 'Cancion encontrada',
            results: ( cancion ) ? [ cancion ] : []
        });
    }

    const regex = new RegExp( termino, 'i' );
    const canciones = await Cancion.find({ nombre: regex, estado: true })
                            .populate('repertorio','nombre')

    res.json({
        results: canciones
    });

}


const buscar = ( req, res = response ) => {
    
    const { coleccion, termino  } = req.params;

    if ( !coleccionesPermitidas.includes( coleccion ) ) {
        return res.status(400).json({
            ok: false,
            msg: `Las colecciones permitidas son: ${ coleccionesPermitidas }`
        })
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(termino, res);
        break;
        case 'repertorios':
            buscarRepertorios(termino, res);
        break;
        case 'canciones':
            buscarCanciones(termino, res);
        break;

        default:
            res.status(500).json({
                ok: false,
                msg: 'Se le olvido hacer esta búsquda'
            })
    }

}



module.exports = {
    buscar
}