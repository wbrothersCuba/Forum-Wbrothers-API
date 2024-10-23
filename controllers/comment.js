'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    add: function (req, res) {
        //get topic id
        var topicId = req.params.topicId;
        // find by topic id
        Topic.findById(topicId).exec((err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al guardar el usuario'
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El tema no existe'
                });
            }
            if (req.body.content) {
                try {
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch (err) {
                    return res.status(200).send({
                        message: 'Faltan datos por enviar'
                    });
                }
                if (validate_content) {
                    var comment = {
                        user: req.user.sub,
                        content: req.body.content
                    }
                    //make a push in the comment object
                    topic.comments.push(comment);
                    topic.save((err) => {
                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario'
                            });
                        }
                        Topic.findById(topic._id)
                            .populate('user')
                            .populate('comments.user')
                            .exec((err, topic) => {
                                if (err) {
                                    return res.status(500).send({
                                        status: 'error',
                                        message: 'Error en la peticion '
                                    });
                                }
                                if (!topic) {
                                    return res.status(404).send({
                                        status: 'error',
                                        message: 'No hay temas'
                                    });
                                }
                                return res.status(200).send({
                                    status: 'success',
                                    topic
                                });
                            });
                    });
                } else {
                    return res.status(200).send({
                        message: 'Datos no validos'
                    });
                }
            }
        });
    },

    update: function (req, res) {
        var commentId = req.params.commentId;
        var params = req.body;
        try {
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_content) {
            //find and update of subdocument
            Topic.findOneAndUpdate(
                { "comments._id": commentId },
                {
                    "$set": {
                        "comments.$.content": params.content
                    }
                },
                { new: true },
                (err, topicUpdate) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar el comentario'
                        });
                    }
                    if (!topicUpdate) {
                        return res.status(404).send({
                            status: 'error',
                            message: 'El tema no existe'
                        });
                    }
                    return res.status(200).send({
                        status: 'success',
                        topic: topicUpdate
                    });
                }
            );
        }
    },

    delete: function (req, res) {
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;
        //searh topic
        Topic.findById(topicId, (err, topic) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al guardar el comentario'
                });
            }
            if (!topic) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El tema no existe'
                })
            }
            var comment = topic.comments.id(commentId);
            if (comment) {
                comment.remove();
                topic.save((err) => {
                    if (err) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al guardar el tema'
                        });
                    }
                    Topic.findById(topic._id)
                            .populate('user')
                            .populate('comments.user')
                            .exec((err, topic) => {
                                if (err) {
                                    return res.status(500).send({
                                        status: 'error',
                                        message: 'Error en la peticion '
                                    });
                                }
                                if (!topic) {
                                    return res.status(404).send({
                                        status: 'error',
                                        message: 'No hay temas'
                                    });
                                }
                                return res.status(200).send({
                                    status: 'success',
                                    topic
                                });
                            });
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'El tema no existe'
                });
            }
        });
    }
};

module.exports = controller;