var mongoose   = require('mongoose');

var options = {
  user: 'oscar',
  pass: '1323Oscar2572'
}

mongoose.connect('mongodb://localhost:27017/catalogoDb', options, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});


//mongoose.connect(uri, options);

