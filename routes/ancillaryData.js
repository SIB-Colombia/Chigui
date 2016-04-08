var express = require('express');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var add_objects = require('../app/models/additionalModels.js');
var AncillaryDataVersion = require('../app/models/ancillaryData.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var ancillary_data_version  = req.body; 
  ancillary_data_version._id = mongoose.Types.ObjectId();

  ancillary_data_version.created=Date();
  ancillary_data_version.state="accepted";
  ancillary_data_version.element="ancillaryData";
  ancillary_data_version = new AncillaryDataVersion(ancillary_data_version);

  var id_v = ancillary_data_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
        add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "ancillaryDataVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.status(406);
              res.send(err);
          }else{
            ancillary_data_version.id_record=id_rc;
            ancillary_data_version.version=doc.ancillaryDataVersion.length+1;
            var ver = ancillary_data_version.version;
            ancillary_data_version.save(function(err){
              if(err){
                res.status(406);
                res.send(err);
              }else{
                res.json({ message: 'Save AncillaryDataVersion', element: 'AncillaryData', version : ver, _id: id_v, id_record : id_rc });
              }
            });
          }
        });
      }
    }else{
      res.status(406);
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  }
    );
  }else{
    res.status(406);
    res.json({message: "The url doesn't have the id for the Record (Ficha)"});
  }
}


exports.getVersion = function(req, res) {
	var id_rc=req.params.id_record;
	var ver=req.params.version;;
	add_objects.RecordVersion.findOne({ _id : id_rc }).populate('ancillaryDataVersion').exec(function (err, record) {
    if(record){
  		if (err){
  			res.send(err);
  		};
  		var len=record.ancillaryDataVersion.length;
  		if(ver<=len && ver>0){
  			res.json(record.ancillaryDataVersion[ver-1]);
  		}else{
  			res.json({message: "The number of version is not valid"});
  		}
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
	});
};



