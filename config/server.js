var mongoose   = require('mongoose');


mongoose.connect('mongodb://localhost:27017/catalogoDbTest', options, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});
