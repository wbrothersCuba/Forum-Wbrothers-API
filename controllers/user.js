'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path')

const { param } = require("../app");

var controller = {

    save: function (req, res) {
        // get app data
        var params = req.body;
        //validate
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        if (validate_name && validate_surname && validate_email && validate_password) {
            //create object
            var user = new User();
            //put user values
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.password = params.password;
            user.role = 'ROLE_USER';
            user.image = null;
            //check if the user exists
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error de dulplicidad de usuarios"
                    });
                }
                if (!issetUser) {
                    //if doesnt exists encrypt pass and saveit   
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    message: "Error al guardar el usuario"
                                });
                            }
                            if (!userStored) {
                                return res.status(400).send({
                                    message: "Error al guardar el usuario"
                                });
                            }
                            return res.status(200).send({
                                status: 'sucess',
                                user: userStored
                            });
                        });
                    });
                } else {
                    return res.status(200).send({
                        message: "Usuario ya registrado",
                    });
                }
            });
        } else {
            return res.status(200).send({
                message: "Error en la entrada de datos del usuarios"
            });
        }
    },

    login: function (req, res) {
        var params = req.body;
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        if (!validate_email || !validate_password) {
            return res.status(400).send({
                message: "Los datos son incorrectos"
            })
        }
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    message: "Error de logeo"
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: "El usuario no existe"
                });
            }
            bcrypt.compare(params.password, user.password, (err, check) => {
                if (check) {
                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }
                    user.password = undefined;
                    return res.status(200).send({
                        status: "success",
                        user
                    });
                } else {
                    return res.status(200).send({
                        message: "Credenciales invalidas"
                    });
                }
            });
        });
    },

    update: function (req, res) {
        //get user data
        var params = req.body;
        //validate
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message: "Faltan datos por enviar"
            });
        }
        delete params.password;
        //check if email exists
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
                if (err) {
                    return res.status(500).send({
                        message: "Error de logeo"
                    });
                }
                if (user && user.email == params.email) {
                    return res.status(404).send({
                        message: "El email no puede ser modificado"
                    });
                } else {
                    var userId = req.user.sub;
                    User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdate) => {
                        if (err || !userUpdate) {
                            return res.status(500).send({
                                status: "error",
                                message: "Error al actualizar el usuario"
                            });
                        }
                        if (!userUpdate) {
                            return res.status(200).send({
                                status: "error",
                                message: "Error al actualizar el usuario"
                            });
                        }
                        return res.status(200).send({
                            status: "success",
                            user: userUpdate
                        });
                    });
                }

            });
        } else {
            //search and update
            var userId = req.user.sub;
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdate) => {
                if (err || !userUpdate) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al actualizar el usuario"
                    });
                }
                if (!userUpdate) {
                    return res.status(200).send({
                        status: "error",
                        message: "Error al actualizar el usuario"
                    });
                }
                return res.status(200).send({
                    status: "success",
                    user: userUpdate
                });
            });
        }
    },

    uploadAvatar: function (req, res) {
        // config multiparty mode (md)
        var file_name = 'Sin Avatar';

        if (!req.file) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        //Get name and extension
        var file_path = req.file.path;
        //var file_split = file_path.split('\\'); for windows
        var file_split = file_path.split('/'); // linux or mac
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        //check if filetype is rigtht
        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: "La extension del archivo no es valida"

                });
            });
        } else {
            //get user id
            var userId = req.user.sub;
            //search and update
            User.findOneAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (err, userUpdate) => {
                if (err || !userUpdate) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar el usuario'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    user: userUpdate
                });
            });

        }
    },
    avatar: function (req, res) {
        var file_name = req.params.fileName;
        var path_file = './uploads/users/' + file_name;
        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        })
    },

    getUsers: function (req, res) {
        User.find().exec((err, users) => {
            if (err || !users) {
                return res.status('404').send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                })
            }
            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function (req, res) {
        var userId = req.params.userId;
        User.findById(userId).exec((err, user) => {
            if (err || !user) {
                return res.status('404').send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                })
            }
            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }


};
module.exports = controller;