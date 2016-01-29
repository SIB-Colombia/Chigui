var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var taxon_objects = require('../app/models/taxonRecordName.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

/* POST */
router.post('/', function(req, res) {
  var test=req.body.hierarchy;
  var fic= new add_objects.RecordVersion(req.body);
  fic.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Record created!!!!', id:fic.id });
            console.log("Record created!!!");
        });
});

module.exports = router;