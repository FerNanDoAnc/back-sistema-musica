const { validationResult } = require('express-validator');


const validarCampos = ( req, res, next ) => {

    const errors = validationResult(req);
    if( !errors.isEmpty() ){
        return res.status(400).json({
            
            errors,
            //Tipo de correo- El correo es obligatorio
            msg: 'Ingreses un correo válido'
        });
    }

    next();
}



module.exports = {
    validarCampos
}
