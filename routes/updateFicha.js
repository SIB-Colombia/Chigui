var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');
var cors = require


/* POST */
router.put('/:ficha_id', function(req, res) {
	var fic= new Record(req.body);
	/*
	Record.findById(req.params.ficha_id, function(err, record){
  		if(err){
  			res.send(err);
  		}else{
  			if(!!record){
  				record=req.body;
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
  		
  	});
*/
	
/*
	var fic= new Record(req.body);
	console.log("El id: "+req.body._id);
	Record.findByIdAndUpdate(req.params.ficha_id, fic,function(err, record){
		if(err){
				res.send(err);
			}else{
				res.json({ message: 'Record update!', id:fic.id });
			}
		});

*/ 	

	Record.findByIdAndUpdate(req.params.ficha_id, fic,function(err, record){
		if(err){
				res.send(err);
			}else{
				res.json({ message: 'Record update!', id:fic.id });
			}
		});

	//delete fic._id;
	/*
	Record.update({_id:req.params.ficha_id},fic,{upsert: true},function(err, fic){
		if(err){
				res.send(err);
			}else{
				res.json({ message: 'Record update!', id:fic.id });
			}
		});
*/
});

module.exports = router;