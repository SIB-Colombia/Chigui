var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Record = require('../app/models/record.js');
Object.assign = require('object-assign');

router.get('/taxons/:ficha_tax', function(req, res){
  console.log("param: "+req.params.ficha_tax);
  Record.find({'taxonRecordName.scientificName.simple':req.params.ficha_tax}, 'taxonRecordName associatedParty', function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});

router.get('/taxon/:ficha_tax', function(req, res){
  console.log(req.params.ficha_tax);
  Record.find({'taxonRecordName.scientificName.simple':{ "$regex": req.params.ficha_tax, "$options": "i" } }, 'taxonRecordName associatedParty', function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});

router.get('/author/:ficha_aut', function(req, res){
  var response={};
  var name = req.params.ficha_aut;
  name = name.replace(/\\"/g, '"');
  name = name.split(" ");
  	if(name.length!=0){
  		if(name.length>=2){
  			Record.find({'associatedParty.firstName':{ "$regex": name[0], "$options": "i" },'associatedParty.lastName':{ "$regex": name[1], "$options": "i" }}, 'taxonRecordName associatedParty', function(err, records){
   		   		if(err)
    		    	res.send(err);
    		  	res.json(records);
   		 	});
  		}else{
  			Record.find({'associatedParty.lastName':{ "$regex": req.params.ficha_aut, "$options": "i" }}, 'taxonRecordName associatedParty', function(err, records){
   		   		if(err)
    		    	res.send(err);
    		  	res.json(records);
   		 	});
  		}
  	}else{
  		res.json({ message: 'No info to search'});
  	}
  });

/*

router.get('/adv/:ficha_tax', function(req, res){
  var name = req.params.ficha_tax.split(" ");
  Record.find(
        { $text : { $search : req.params.ficha_tax } }, 
        { score : { $meta: "textScore" } }).sort({ score : { $meta : 'textScore' } }).exec(function(err, results) {
        if(err)
          res.send(err);
        res.json(results);
    });
});


router.get('/findh/:ficha_tax', function(req, res){
  console.log("headers: "+JSON.stringify(req.headers));
  console.log("param: "+req.params.ficha_tax);
  var val = req.params.ficha_tax;
  Record.find({'taxonRecordName.scientificName.simple':req.params.ficha_tax}, function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});
*/

module.exports = router;