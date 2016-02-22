var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Record = require('../app/models/record.js');
Object.assign = require('object-assign');

router.get('/taxons/:ficha_tax', function(req, res){
  Record.find({'taxonRecordName.scientificName.simple':req.params.ficha_tax}, 'taxonRecordName associatedParty', function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});

router.get('/taxon/:ficha_tax', function(req, res){
  Record.find({'taxonRecordName.scientificName.simple':{ "$regex": req.params.ficha_tax, "$options": "i" } }, 'taxonRecordName associatedParty', function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});

router.get('/tax_author/:ficha_aut_tax', function(req, res){
  var response={};
  var consl = req.params.ficha_aut_tax;
  consl = consl.replace(/\\"/g, '"');
  consl = consl.split("-");
  	if(consl.length!=0){
  		if(consl.length>=2){
  			Record.find({'associatedParty.firstName':{ "$regex": consl[0], "$options": "i" },'associatedParty.lastName':{ "$regex": consl[1], "$options": "i" }}, 'taxonRecordName associatedParty', {sort : { _id: -1 }}, function(err, records){
   		   		if(err)
    		    	res.send(err);
            for(i=0;i<records.length;i++){
              creation_date=records[i]._id.getTimestamp();
              records[i]._doc.creation_date =creation_date;
            }
    		  	res.json(records);
   		 	});
  		}else{
  			Record.find({'taxonRecordName.scientificName.simple':{ "$regex": req.params.ficha_aut_tax, "$options": "i" } }, 'taxonRecordName associatedParty', {sort : { _id: -1 }}, function(err, records){
   		   		if(err)
    		    	res.send(err);
            for(i=0;i<records.length;i++){
              creation_date=records[i]._id.getTimestamp();
              records[i].creation_date =creation_date;
              records[i]._doc.creation_date =creation_date;
            }
    		  	res.json(records);
   		 	});
  		}
  	}else{
  		res.json({ message: 'No results'});
  	}
  });




module.exports = router;