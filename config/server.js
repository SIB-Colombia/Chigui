var mongoose   = require('mongoose');

var options = {
  user: 'testcatalogo',
  pass: '1323catalogotest'
}

mongoose.connect('mongodb://54.82.249.77:27017/catalogoDbTest', options, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});
