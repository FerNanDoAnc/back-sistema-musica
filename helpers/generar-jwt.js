const jwt = require('jsonwebtoken');

const generarJWT = ( uid = '' ) => {

    const payload = { 
        uid
    };
    return new Promise( (resolve, reject) => {


        jwt.sign( payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '1440h'
        }, ( err, token ) => {

            if ( err ) {
                console.log(err);
                reject( 'No se pudo generar el token' )
            } else {
                resolve( token );
            }
        })

    })
}




module.exports = {
    generarJWT
}

