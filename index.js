'use strict'

const { config } = require('dotenv');
var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;
config();

mongoose.set('useFindAndModify',false);
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true})
        .then(()=>{
            console.log(':)=> connection successful');
            //server
            app.listen(port, ()=>{
                console.log(':)=> server is runnig');
            });
        })
        .catch(error=> console.log(error));