var express = require('express');
var async = require('async');
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
  ancillary_data_version.element="ancillaryData";
  var eleValue = ancillary_data_version.ancillaryData;
  ancillary_data_version = new AncillaryDataVersion(ancillary_data_version);

  var id_v = ancillary_data_version._id;
  var id_rc = req.params.id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  var ver = "";

  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
      async.waterfall([
        function(callback){ 
          add_objects.RecordVersion.findById(id_rc , function (err, data){
            if(err){
              //callback(new Error("failed getting something!:" + err.message));
              callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist.:" + err.message));
            }else{
              callback(null, data);
            }
          });
        },
        function(data,callback){ 
          if(data){
            var lenancillaryData = data.ancillaryDataVersion.length;
            if( lenancillaryData !=0 ){
              var idLast = data.ancillaryDataVersion[lenancillaryData-1];
              AncillaryDataVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of ancillaryDataVersion:" + err.message));
                }else{
                  var prev = doc.ancillaryData;
                  var next = ancillary_data_version.ancillaryData;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    ancillary_data_version.id_record=id_rc;
                    ancillary_data_version.version=lenancillaryData+1;
                    callback(null, ancillary_data_version);
                  }else{
                    callback(new Error("The data in ancillaryData is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              ancillary_data_version.id_record=id_rc;
              ancillary_data_version.version=1;
              callback(null, ancillary_data_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(ancillary_data_version, callback){ 
          ver = ancillary_data_version.version;
          ancillary_data_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, ancillary_data_version);
            }
          });
      },
      function(ancillary_data_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "ancillaryDataVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
            if(err){
              callback(new Error("failed added id to RecordVersion:" + err.message));
            }else{
              callback();
            }
          });
      }
      ],function(err, result) {
          if (err) {
            console.log("Error: "+err);
            res.status(406);
            res.json({ message: ""+err });
          }else{
            res.json({ message: 'Save AncillaryDataVersion', element: 'ancillaryData', version : ver, _id: id_v, id_record : id_rc });
          }
        }
      );
   }else{
    res.status(406);
    res.json({message: "Empty data in version of the element"});
   } 
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



