var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var MolecularDataVersion = require('../app/models/molecularData.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('molecularDataVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.molecularDataVersion.length;
      if(ver<=len && ver>0){
        res.json(record.molecularDataVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.postVersion = function(req, res) {
  var molecular_data_version  = req.body; 
  molecular_data_version._id = mongoose.Types.ObjectId();
  molecular_data_version.created=Date();
  molecular_data_version.element="molecularData";
  var eleValue = molecular_data_version.molecularData;
  molecular_data_version = new MolecularDataVersion(molecular_data_version);

  var id_v = molecular_data_version._id;
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
            var lenmolecularData = data.molecularDataVersion.length;
            if( lenmolecularData !=0 ){
              var idLast = data.molecularDataVersion[lenmolecularData-1];
              MolecularDataVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of molecularDataVersion:" + err.message));
                }else{
                  var prev = doc.molecularData;
                  var next = molecular_data_version.molecularData;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    molecular_data_version.id_record=id_rc;
                    molecular_data_version.version=lenmolecularData+1;
                    callback(null, molecular_data_version);
                  }else{
                    callback(new Error("The data in molecularData is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              molecular_data_version.id_record=id_rc;
              molecular_data_version.version=1;
              callback(null, molecular_data_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(molecular_data_version, callback){ 
          ver = molecular_data_version.version;
          molecular_data_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, molecular_data_version);
            }
          });
      },
      function(molecular_data_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "molecularDataVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save MolecularDataVersion', element: 'molecularData', version : ver, _id: id_v, id_record : id_rc });
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