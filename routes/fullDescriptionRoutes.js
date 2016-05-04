var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var FullDescriptionVersion = require('../app/models/fullDescription.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var full_description_version  = req.body; 
  full_description_version._id = mongoose.Types.ObjectId();
  full_description_version.created=Date();
  full_description_version.element="fullDescription";
  var eleValue = full_description_version.fullDescription;
  full_description_version = new FullDescriptionVersion(full_description_version);

  var id_v = full_description_version._id;
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
            var lenfullDescription = data.fullDescriptionVersion.length;
            if( lenfullDescription !=0 ){
              var idLast = data.fullDescriptionVersion[lenfullDescription-1];
              FullDescriptionVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of fullDescriptionVersion:" + err.message));
                }else{
                  var prev = doc.fullDescription;
                  var next = full_description_version.fullDescription;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    full_description_version.id_record=id_rc;
                    full_description_version.version=lenfullDescription+1;
                    callback(null, full_description_version);
                  }else{
                    callback(new Error("The data in fullDescription is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              full_description_version.id_record=id_rc;
              full_description_version.version=1;
              callback(null, full_description_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(full_description_version, callback){ 
          ver = full_description_version.version;
          full_description_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, full_description_version);
            }
          });
      },
      function(full_description_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "fullDescriptionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save FullDescriptionVersion', element: 'fullDescription', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('fullDescriptionVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.fullDescriptionVersion.length;
      if(ver<=len && ver>0){
        res.json(record.fullDescriptionVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



