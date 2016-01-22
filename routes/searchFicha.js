var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Record = require('../app/models/record.js');
Object.assign = require('object-assign');

router.get('/taxons/:ficha_tax', function(req, res){
  console.log("param: "+req.params.ficha_tax);
  Record.find({'taxonRecordName.scientificName.simple':req.params.ficha_tax}, function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});

router.get('/taxon/:ficha_tax', function(req, res){
  console.log(req.params.ficha_tax);
  Record.find({'taxonRecordName.scientificName.simple':{ "$regex": req.params.ficha_tax, "$options": "i" } }, function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });
});

router.get('/author/:ficha_aut', function(req, res){
  var name = req.params.ficha_aut.split(" ");
  Record.find({'associatedParty.firstName':name[0],'associatedParty.lastName':name[1]}, function(err, records){
      if(err)
        res.send(err);
      res.json(records);
    });

  var queryFullName=Record.find({'associatedParty.firstName':name[0],'associatedParty.lastName':name[1]});

  var queryFirstName =Record.find({'associatedParty.firstName':name[0],'associatedParty.lastName':name[1]});
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