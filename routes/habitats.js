var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var HabitatsVersion = require('../app/models/habitats.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('habitatsVersion').exec(function (err, record) {
    if(record){
  		if (err){
  			res.send(err);
  		};
  		var len=record.habitatsVersion.length;
  		if(ver<=len && ver>0){
  			res.json(record.habitatsVersion[ver-1]);
  		}else{
  			res.json({message: "The number of version is not valid"});
  		}
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};

exports.postVersion = function(req, res) {
  var habitats_version  = req.body; 
  //console.log(identification_keys_version);
  habitats_version._id = mongoose.Types.ObjectId();

  habitats_version.created=Date();
  habitats_version = new HabitatsVersion(habitats_version);

  var id_v = habitats_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "habitatsVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          habitats_version.id_record=id_rc;
          habitats_version.version=doc.habitatsVersion.length+1;
          var ver = habitats_version.version;
          habitats_version.save(function(err){
            if(err){
              res.send(err);
            }
            res.json({ message: 'Save HabitatsVersion', element: 'habitatsVersion', version : ver, _id: id_v, id_record : id_rc });
          });
        });
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  }
    );
  }else{
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}