const path = require('path');
const fs   = require('fs');

const cloudinary = require('cloudinary');
// cloudinary.config( process.env.CLOUDINARY_URL );
cloudinary.config( {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
} );

const { response } = require('express');
const { subirArchivo } = require('../helpers');

const { Usuario, Cancion, Repertorio } = require('../models');


const cargarArchivo = async(req, res = response) => {

    try {
        
        // txt, md
        // const nombre = await subirArchivo( req.files, ['txt','md'], 'textos' );
        const nombre = await subirArchivo( req.files, undefined, 'imgs' );
        res.status(200).json({ nombre });

    } catch (msg) {
        res.status(400).json({ msg, msg2: 'Error al subir archivo' });
    }

}


const actualizarImagen = async(req, res = response ) => {
    try { 
        const { id, coleccion } = req.params;

        let modelo;

        switch ( coleccion ) {
            case 'usuarios':
                modelo = await Usuario.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${ id }`
                    });
                }
            
            break;

            case 'canciones':
                modelo = await Cancion.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe una cancion con el id ${ id }`
                    });
                }
            
            break;

            case 'repertorios':
                modelo = await Repertorio.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe un repertorio con el id ${ id }`
                    });
                }
            
            break;
        
            default:
                return res.status(500).json({ msg: 'Se me olvidó validar esto'});
        }


        // Limpiar imágenes previas
        if ( modelo.img ) {
            // Hay que borrar la imagen del servidor
            const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img );
            if ( fs.existsSync( pathImagen ) ) {
                fs.unlinkSync( pathImagen );
            }
        }


        const nombre = await subirArchivo( req.files, undefined, coleccion );
        modelo.img = nombre;

        await modelo.save();


        res.json( modelo );
    } catch (error) {
       return res.status(500).json({ msg: 'Error al actualizar la imagen', error });
    }

}


const actualizarImagenCloudinary = async(req, res = response ) => {
    try {
        const { id, coleccion } = req.params;

        let modelo;

        switch ( coleccion ) {
            case 'usuarios':
                modelo = await Usuario.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${ id }`
                    });
                }
            
            break;

            case 'canciones':
                modelo = await Cancion.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe una cancion con el id ${ id }`
                    });
                }
            
            break;

            case 'repertorios':
                modelo = await Repertorio.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe un repertorio con el id ${ id }`
                    });
                }
            
            break;
        
            default:
                return res.status(500).json({ msg: 'Se me olvidó validar esto'});
        }


        // Limpiar imágenes previas
        if ( modelo.img ) {
            const nombreArr = modelo.img.split('/');
            const nombre    = nombreArr[ nombreArr.length - 1 ];
            const [ public_id ] = nombre.split('.');
            cloudinary.uploader.destroy( public_id );
        }


        const { tempFilePath } = req.files.archivo
        const { secure_url } = await cloudinary.uploader.upload( tempFilePath );
        modelo.img = secure_url;

        await modelo.save();

        
        res.json( modelo );
    } catch (error) {
        return res.status(500).json({ msg: 'Error al actualizar Imagen Cloudinary ', error });
    }

}

const mostrarImagen = async(req, res = response ) => {
    try { 
        const { id, coleccion } = req.params;

        let modelo;

        switch ( coleccion ) {
            case 'usuarios':
                modelo = await Usuario.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe un usuario con el id ${ id }`
                    });
                }
            
            break;

            case 'canciones':
                modelo = await Cancion.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe una cancion con el id ${ id }`
                    });
                }
            
            break;

            case 'repertorios':
                modelo = await Repertorio.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `No existe un repertorio con el id ${ id }`
                    });
                }
            
            break;
        
            default:
                return res.status(500).json({ msg: 'Se me olvidó validar esto'});
        }

        // Limpiar imágenes previas
        if ( modelo.img ) {
            // Hay que borrar la imagen del servidor
            const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img );
            if ( fs.existsSync( pathImagen ) ) {
                return res.sendFile( pathImagen )
            }
        }

        const pathImagen = path.join( __dirname, '../assets/no-image.jpg');
        res.sendFile( pathImagen );

    } catch (error) {
        return res.status(500).json({ msg: 'Error al mostrar la imagen', error });
    }
}




module.exports = {
    cargarArchivo,
    actualizarImagen,
    mostrarImagen,
    actualizarImagenCloudinary
}