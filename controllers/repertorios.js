const { response } = require('express');
const { Repertorio } = require('../models');


const obtenerRepertorios = async(req, res = response ) => {

    const { limite = 4, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, repertorios ] = await Promise.all([
        Repertorio.countDocuments(query),
        Repertorio.find(query)
            .populate('usuario', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);
    
    res.status(200).json({
        ok: true,
        total,
        repertorios,
        msg: 'Repertorios obtenidos'
    });
}

const obtenerRepertoriosPorUsuario = async(req, res=response)=> {
    const { usuario } = req.params;
    // const { ...data } = req.body;
    
    const { limite = 4, desde = 0 } = req.query;
    const query = { estado: true };
    if ( usuario ) {
        query.usuario = usuario;
    }

    const [ total, repertorios ] = await Promise.all([
        Repertorio.countDocuments(query),
        Repertorio.find(query)
            .populate('usuario', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);
    
    res.status(200).json( {
        ok:true,
        total,
        repertorios
    } );
}

const obtenerRepertorio = async(req, res = response ) => {

    const { id } = req.params;
    const repertorio = await Repertorio.findById( id )
                            .populate('usuario', 'nombre');

    res.status(200).json( {
        ok:true,
        repertorio
    } );

}

const crearRepertorio = async(req, res = response ) => {

    const nombre = req.body.nombre.toUpperCase();

    const repertorioDB = await Repertorio.findOne({ nombre });

    if ( repertorioDB ) {
        return res.status(400).json({
            ok:false,
            msg: `El repertorio ${ repertorioDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        nombre,
        usuario: req.body.usuario
        // usuario: req.usuario._id --con jwt y v1
    }

    const repertorio = new Repertorio( data );

    // Guardar DB
    await repertorio.save();

    res.status(201).json({
        ok:true,
        repertorio
    });

}

const actualizarRepertorio = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    data.nombre  = data.nombre.toUpperCase();
    // data.usuario = req.usuario._id;
    usuario: req.body.usuario
    const repertorio = await Repertorio.findByIdAndUpdate(id, data, { new: true });

    res.status(200).json( {
        ok:true,
        repertorio
    });

}

const borrarRepertorio = async(req, res =response ) => {

    const { id } = req.params;
    const repertorioBorrado = await Repertorio.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.status(200).json( {
        ok:true,
        repertorioBorrado
    });
}




module.exports = {
    crearRepertorio,
    obtenerRepertorios,
    obtenerRepertorio,
    actualizarRepertorio,
    borrarRepertorio,
    obtenerRepertoriosPorUsuario
}