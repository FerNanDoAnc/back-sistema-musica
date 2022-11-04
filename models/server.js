const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const http = require('http'); 

const { dbConnection } = require('../database/config'); 
// 
const { Cancion } = require('.');

class Server {

    constructor() {
        this.app  = express(); 
        // Socket
        this.server = http.createServer(this.app);
        this.io = require('socket.io')(this.server);

        this.port = process.env.PORT;
        this.portSocket=process.env.PORT_SOCKET;

        this.paths = {
            auth:       '/api/auth',
            buscar:     '/api/buscar',
            repertorios: '/api/repertorios',
            canciones:  '/api/canciones',
            usuarios:   '/api/usuarios',
            uploads:    '/api/uploads',
        }

        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();

        this.ioConnection();
    }

    ioConnection() {
        this.io.on('connection',(socket)=>{
            console.log('un usuario conectado');

            socket.emit('back-event',{data:'desde el servidor'}); 
            socket.on('front-event',(data)=>{ console.log(data); });

            // Listar canciones por repertorio 
            // En deshuso por el momento
            socket.on("listDos-cancion-rep",async (data)=>{
                try {
                    const { _id } = data;
                    const query = { estado: true };
                    if ( _id ) {
                        query.repertorio = _id; 
                    }
                    await Cancion.find(query)
                        .populate('usuario', 'nombre')
                        .populate('repertorio', 'nombre')
                        .sort({ indice: 1 })
                        .exec((err, canciones) => {
                            if (err) {
                                return this.io.emit('listDos-cancion-rep', { ok: false, err });
                            }
                            socket.emit('listDos-cancion-rep', { ok: true,msg: 'Canciones listadas', canciones }); 
                        }
                    );
                } catch (error) {
                    console.log(error);
                }
            });
            // Actualizar indice de canciones
            socket.on("update-index-cancion",async (data)=>{
                try { 
                    const cancionesRes=[];
                    const canciones = [];

                    data.forEach(async (element) => {
                        const { _id, indice } = element;
                        const query = { _id };
                        const update = { indice };
                        const options = { new: true };

                        await Cancion.findOneAndUpdate(query, update, options)
                            .sort({ update: 1}) 
                            .exec((err, cancion) => {
                                // por ahora no se utiliza el retorno
                                if (err) {
                                    return this.io.emit('update-index-cancion', { ok: false, err });
                                } 
                                
                                cancionesRes.push(cancion);
                                if (cancionesRes.length === data.length) { 
                                    return this.io.emit('update-index-cancion', { ok: true, msg: 'Cancion actualizada', canciones: cancionesRes });
                                }
                            });
 
                        // cancionesRes.push(cancionesAwait);

                        // if (cancionesRes.length===data.length) { 
                        //     cancionesRes.forEach((element) => { 
                        //         if (!canciones.includes(element)) { 
                        //             canciones.push(element);
                        //         }
                        //     }); 
                        //     this.io.emit('update-index-cancion', { ok: true, canciones });
                        // }
                    });
 
                    
                }
                catch (error) {
                    console.log(error);
                }
            });

        }); 
        
    }

    async conectarDB() {
        await dbConnection();
    }

    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static('public') );

        // Fileupload - Carga de archivos
        this.app.use( fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));

    }

    routes() {
        
        this.app.use( this.paths.auth, require('../routes/auth'));
        this.app.use( this.paths.buscar, require('../routes/buscar'));
        this.app.use( this.paths.repertorios, require('../routes/repertorios'));
        this.app.use( this.paths.canciones, require('../routes/canciones'));
        this.app.use( this.paths.usuarios, require('../routes/usuarios'));
        this.app.use( this.paths.uploads, require('../routes/uploads'));
    
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });

        // Servidor socket
        this.server.listen( this.portSocket, () => {
            console.log('Io corriendo en puerto', this.portSocket );
        });
    }

}



module.exports = Server;
