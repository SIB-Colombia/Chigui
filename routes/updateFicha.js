var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var Record = require('../app/models/record.js');
var cors = require


/* POST */
router.put('/:ficha_id', function(req, res) {
	var fic= new Record(req.body);

	fic._id=req.params.ficha_id;

	Record.findByIdAndUpdate(req.params.ficha_id, fic,function(err, record){
		if(err){
				res.send(err);
			}else{
				res.json({ message: 'Record update!', id:fic.id });
			}
		});

});

module.exports = router;