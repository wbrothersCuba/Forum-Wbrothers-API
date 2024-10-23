'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
const { default: isEmail } = require('validator/lib/isEmail');

exports.createToken = function(user){
    var payload = {
        sub: user.id,
        name: user.name,
        surmname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }
    return jwt.encode(payload, 'mi-super-clave-secreta-745196196');
}