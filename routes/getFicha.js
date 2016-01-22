var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var textSearch = require('mongoose-text-search');
var Record = require('../app/models/record.js');
Object.assign = require('object-assign');

//var schemaFicha = new mongoose.Schema({name:'string'},{ strict: false });
//var Ficha = mongoose.model('Ficha', schemaFicha);

/* GET . */
router.get('/', function(req, res) {
  var response={};
  Record.find({},function(err,data){
  		if(err){
  			response = {"error" : true,"message" : "Error fetching data"};
  		}else{
  			console.log(data.length);
  			response = data;
  		}
  		res.json(response);
  });
});

router.get('/:ficha_id', function(req, res) {
    Record.findById(req.params.ficha_id, function(err, record){
  		if(err)
  			res.send(err);
  		res.json(record);
  	});
});


router.get('/pagination/:page/:limit',function(req, res){
  var response={};
  Record.paginate({}, { page: req.params.page, limit: req.params.limit }, function(err, data) {
    if(err){
        response = {"error" : true,"message" : "Error fetching data"};
      }else{
        console.log(data.length);
        response = data;
      }
      res.json(response);
  });
});





module.exports = router;

