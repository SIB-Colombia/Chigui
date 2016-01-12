var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var taxonRecordVersion = require('../app/models/elementVersion.js');
var cors = require


/* POST */
router.post('/post', function(req, res) {
  var fic= new taxonRecordVersion(req.body);
  fic.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Record created!', id:fic.id });
            console.log("Record created!");
        });
});

module.exports = router;