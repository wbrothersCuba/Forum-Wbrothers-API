'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'mi-super-clave-secreta-745196196';


exports.authenticated = function (req, res, next) {
    //Check if get authorization
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: "La peticion no esta autorizada"
        });
    }
    //remove " from token
    var token = req.headers.authorization.replace(/['"']+/g, '');

    try {
        //decrypt token
        var payload = jwt.decode(token, secret);
        // check if has expired
        if (payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: "El token ha expirado"
            })
        }
    } catch (ex) {
        return res.status(404).send({
            message: "El token no es valido"
        });
    }
    req.user = payload;
    next();
}