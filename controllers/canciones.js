const { response } = require('express');
const { Cancion } = require('../models');


const obtenerCanciones = async(req, res = response ) => {

    const { limite = 100, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, canciones ] = await Promise.all([
        Cancion.countDocuments(query),
        Cancion.find(query)
            .populate('usuario', 'nombre')
            .populate('repertorio', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        ok:true,
        msg: 'Canciones obtenidas!',
        total,
        canciones
    });
}

const obtenerCancionesPorRepertorio = async(req, res = response ) => {
    const { repertorio } = req.params;

    const { limite = 100, desde = 0 } = req.query;
    const query = { estado: true };
    if ( repertorio ) {
        query.repertorio = repertorio;
    }
    
    const [ total, canciones ] = await Promise.all([
        Cancion.countDocuments(query),
        Cancion.find(query)
            .populate('usuario', 'nombre')
            .populate('repertorio', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
            .sort({ indice: 1 }) // ordenar por indice
    ]);

    res.json({
        ok:true,
        msg: 'Canciones obtenidas!',
        total,
        canciones
    });
}

const obtenerCancion = async(req, res = response ) => {

    const { id } = req.params;
    const cancion = await Cancion.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('repertorio', 'nombre');

    res.json( {
        ok:true,
        msg: 'Cancion obtenida!',
        cancion
    } );

}

const crearCancion = async(req, res = response ) => {

    const { estado, usuario, ...body } = req.body;
    
    const cancionDB = await Cancion.findOne({ nombre: body.nombre });
    
    // El modelo esta en false, x eso pasa normal
    // if ( cancionDB ) {
    //     return res.status(400).json({
    //         ok:false,
    //         msg: `La cancion ${ cancionDB.nombre }, ya existe`
    //     });
    // }

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.body.usuario,
        
        // con jwt si es q se envia desde el front
        // usuario: req.usuario._id
    }
    
    const cancion = new Cancion( data );

    // Guardar DB
    await cancion.save();

    res.status(201).json({
        ok:true,
        msg: 'Cancion creada',
        cancion
    });

}

const actualizarCancion = async( req, res = response ) => {

    const { id } = req.params;
    const { estado, usuario, ...data } = req.body;

    if( data.nombre ) {
        data.nombre  = data.nombre.toUpperCase();
    }

    // data.usuario = req.usuario._id;
    data.usuario= req.body.usuario;
    const cancion = await Cancion.findByIdAndUpdate(id, data, { new: true });

    res.json( {
        ok:true,
        msg: 'Cancion actualizada',
        cancion
    } );

}

const borrarCancion = async(req, res = response ) => {

    const { id } = req.params;
    const cancionBorrada = await Cancion.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json( {
        ok:true,
        msg: 'Cancion borrada',
        cancionBorrada
    } );
}




module.exports = {
    crearCancion,
    obtenerCanciones,
    obtenerCancion,
    actualizarCancion,
    borrarCancion,
    obtenerCancionesPorRepertorio
}