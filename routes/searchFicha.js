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
  		res.json({ message: 'No results'});
  	}
  });

router.get('/tax_author/:ficha_aut_tax', function(req, res){
  var response={};
  var consl = req.params.ficha_aut_tax;
  consl = consl.replace(/\\"/g, '"');
    if(consl.length!=0){
        Record.find({'associatedParty.firstName':{ "$regex": consl, "$options": "i" }}, 'taxonRecordName associatedParty', function(err, recordsA){
            if(err)
              res.send(err);
            if(recordsA.length==0){
              Record.find({'associatedParty.lastName':{ "$regex": consl, "$options": "i" }}, 'taxonRecordName associatedParty', function(err, recordsB){
                if(err)
                  res.send(err);
                if(recordsB.length==0){
                  Record.find({'taxonRecordName.scientificName.simple':{ "$regex": consl, "$options": "i" } }, 'taxonRecordName associatedParty', function(err, recordsC){
                    if(err)
                      res.send(err);
                    if(recordsC.length==0){
                      res.json({ message: 'No results'});
                    }else{
                      res.json(recordsC);
                    }
                  });
                }else{
                  res.json(recordsB);
                }
              });
            }else{
              res.json(recordsA);
            }
        });
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