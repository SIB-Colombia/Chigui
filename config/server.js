import mongoose from 'mongoose';
//var mongoose   = require('mongoose');
mongoose.connect('mongodb://54.165.63.70:27017/catalogoDb', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});
