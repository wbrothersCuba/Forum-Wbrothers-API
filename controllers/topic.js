'use strict'

var validator = require('validator');
var Topic = require('../models/topic');
var User = require('../models/user');
const topic = require('../models/topic');
const { param } = require('../routes/topic');

var controller = {

    save: function (req, res) {
        var params = req.body;
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos'
            })
        }
        if (validate_title && validate_content && validate_lang) {
            var topic = new Topic();
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub;

            topic.save((err, topicStore) => {
                if (err || !topicStore) {
                    return res.status(404).send({
                        status: 'erro',
                        message: 'El tema no se guardo'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    topic: topicStore
                });
            });
        } else {
            return res.status(200).send({
                message: 'Datos invalidos'
            })
        }
    },

    getTopics: function (req, res) {
        //load pagination library (in model class)
        // get current page
        if (!req.params.page || req.params.page == null || req.params.page == undefined || req.params.page == 0 || req.params.page == "0") {
            var page = 1;
        } else {
            var page = parseInt(req.params.page);
        }
        // paginate options
        var options = {
            sort: { date: -1 }, // oder new to old
            populate: 'user',
            limit: 5,
            page: page
        };
        //paginate
        Topic.paginate({}, options, (err, topics) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'
                });
            }
            if (!topics) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas'
                });
            }
            return res.status(200).send({
                status: 'success',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            })
        });
    },
    getTopicsByUser: function (req, res) {
        var userId = req.params.user;
        Topic.find({
            user: userId
        })
            .sort([['date', 'descending']])
            .exec((err, topics) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion '
                    });
                }
                if (!topics) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No hay temas'
                    });
                }
                return res.status(200).send({
                    status: 'success',
                    topics
                });
            });
    },

    getTopic: function (req, res) {
        var topicId = req.params.id;
        Topic.findById(topicId)
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
    },

    update: function (req, res) {
        var topicId = req.params.id;
        //get data
        var params = req.body;
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos'
            })
        }
        if (validate_title && validate_content && validate_lang) {
            var update = {
                title: params.title,
                content: params.content,
                code: params.code,
                lang: params.lang
            };
            //find and update by topic id and user id
            Topic.findOneAndUpdate({ _id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdate)=>{
               if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
               }
               if(!topicUpdate){
                return res.status(404).send({
                    status: 'error',
                    message: 'Tema no actualizado'
                });
               }
                return res.status(200).send({
                    status: 'success',
                    topicUpdate
                });
            });
        } else {
            return res.status(200).send({
                message: 'La validacion de los datos no es correcta',
            });
        }
    },

    delete: function(req, res){
        var topicId = req.params.id;
        Topic.findOneAndDelete({ _id: topicId, user: req.user.sub}, (err, topicRemove)=>{
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
               }
               if(!topicRemove){
                return res.status(404).send({
                    status: 'error',
                    message: 'Tema no eliminado'
                });
               }
            return res.status(200).send({
                status: 'success',
                topic: topicRemove
            })
        });  
    },

    search:function(req, res){
        //get string from url
        var searchString = req.params.search;
        //find or
        Topic.find({"$or":[
            {"title":{"$regex": searchString, "$options": "i"}},
            {"content":{"$regex": searchString, "$options": "i"}},
            {"code":{"$regex": searchString, "$options": "i"}},
            {"lang":{"$regex": searchString, "$options": "i"}}
        ]})
        .populate('user')
        .sort([['date', 'descending']])
        .exec((err, topics) =>{
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la peticion'
                });
            }
            if(!topics){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas disponibles'
                });
            }
            return res.status(200).send({
                status: 'success',
                topics
            });
        });
     }


}

module.exports = controller;