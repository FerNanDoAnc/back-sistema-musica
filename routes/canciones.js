const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const { crearCancion,
        obtenerCanciones,
        obtenerCancion,
        actualizarCancion, 
        obtenerCancionesPorRepertorio,
        borrarCancion } = require('../controllers/canciones');

const { existeRepertorioPorId, existeCancionPorId } = require('../helpers/db-validators');

const router = Router();


//  Obtener todas las repertorios - publico
router.get('/', obtenerCanciones );

//  Obtener todas las repertorios por reprtorio
router.get('/repertorio/:repertorio', obtenerCancionesPorRepertorio );

// Obtener un repertorio por id - publico
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeCancionPorId ),
    validarCampos,
], obtenerCancion );

// Crear repertorio - privado - cualquier persona con un token válido
router.post('/', [ 
    // validarJWT,
    check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('repertorio','No es un id de Mongo').isMongoId(),
    check('repertorio').custom( existeRepertorioPorId ),
    // validarCampos
], crearCancion );

// Actualizar - privado - cualquiera con token válido
router.put('/:id',[
    // validarJWT,
    // check('repertorio','No es un id de Mongo').isMongoId(),
    check('id').custom( existeCancionPorId ),
    validarCampos
], actualizarCancion );

// Borrar una repertorio - Admin
router.delete('/:id',[
    // validarJWT,
    // esAdminRole,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeCancionPorId ),
    validarCampos,
], borrarCancion );


module.exports = router;