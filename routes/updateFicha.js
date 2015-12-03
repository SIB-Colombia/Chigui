var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');
var cors = require


/* POST */
router.put('/:ficha_id', function(req, res) {
	var fic= new Record(req.body);
	Record.findById(req.params.ficha_id, function(err, record){
  		if(err){
  			res.send(err);
  		}else{
  			if(!!record){
  				record=fic;
  				record.save(function(err) {
  					if(err){
  						res.send(err);
  					}else{
  						res.json({ message: 'Record update!', id:fic.id });
  					}
  				});
  			}else{
  					res.json({"message" : "No exists that record"});
  			}
  		}
  		
  		/*
  		record.save(function(err) {
  			if(err)
  				res.send(err);
  			res.json({ message: 'Record update!', id:fic.id });
  		});
		*/
  		
  	});
});

module.exports = router;