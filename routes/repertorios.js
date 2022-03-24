const { Router } = require('express');
const { check } = require('express-validator');

const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');

const { crearRepertorio,
        obtenerRepertorios,
        obtenerRepertoriosPorUsuario,
        obtenerRepertorio,
        actualizarRepertorio,
        borrarRepertorio } = require('../controllers/repertorios');
const { existeRepertorioPorId } = require('../helpers/db-validators');

const router = Router();

/**
 * {{url}}/api/categorias
 */

//  Obtener todas las categorias con limite de 5 - publico
router.get('/', obtenerRepertorios );

// Obtener una categoria por id - publico
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeRepertorioPorId ),
    // validarCampos,
], obtenerRepertorio );

// Crear categoria - privado - cualquier persona con un token válido
router.post('/', 
[ 
    // validarJWT,
    check('nombre','El nombre es obligatorio').not().isEmpty(),
    validarCampos
], 
crearRepertorio);

// Actualizar - privado - cualquiera con token válido
router.put('/:id',[
    // validarJWT,
    check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('id').custom( existeRepertorioPorId ),
    validarCampos
],actualizarRepertorio );

// Borrar una categoria - Admin
router.delete('/:id',[
    // validarJWT,
    // esAdminRole,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeRepertorioPorId ),
    validarCampos,
],borrarRepertorio);



module.exports = router;