'use srict'

var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');
//var multipart = require('connect-multiparty');
//var md_upload = multipart({uploadDir: './uploads/users'});
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/users/')
    },
    filename: function(req, file, cb){
        cb(null,"user"+ Date.now() + file.originalname)
    }
});

const upload = multer ({storage: storage});

//routes
router.post('/register',UserController.save);
router.post('/login',UserController.login);
router.put('/user/update', md_auth.authenticated,UserController.update);
router.post('/upload-avatar', [upload.single('file0'), md_auth.authenticated],UserController.uploadAvatar);
router.get('/avatar/:fileName',UserController.avatar);
router.get('/users',UserController.getUsers);
router.get('/user/:userId',UserController.getUser);


module.exports = router;