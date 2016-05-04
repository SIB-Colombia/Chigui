var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var BriefDescriptionVersion = require('../app/models/briefDescription.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var brief_description_version  = req.body; 
  brief_description_version._id = mongoose.Types.ObjectId();
  brief_description_version.created=Date();
  brief_description_version.element="briefDescription";
  var eleValue = brief_description_version.briefDescription;
  brief_description_version = new BriefDescriptionVersion(brief_description_version);

  var id_v = brief_description_version._id;
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
            var lenbriefDescription = data.briefDescriptionVersion.length;
            if( lenbriefDescription !=0 ){
              var idLast = data.briefDescriptionVersion[lenbriefDescription-1];
              BriefDescriptionVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of briefDescriptionVersion:" + err.message));
                }else{
                  var prev = doc.briefDescription;
                  var next = brief_description_version.briefDescription;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    brief_description_version.id_record=id_rc;
                    brief_description_version.version=lenbriefDescription+1;
                    callback(null, brief_description_version);
                  }else{
                    callback(new Error("The data in briefDescription is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              brief_description_version.id_record=id_rc;
              brief_description_version.version=1;
              callback(null, brief_description_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(brief_description_version, callback){ 
          ver = brief_description_version.version;
          brief_description_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, brief_description_version);
            }
          });
      },
      function(brief_description_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "briefDescriptionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save BriefDescriptionVersion', element: 'briefDescription', version : ver, _id: id_v, id_record : id_rc });
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
  var ver=req.params.version;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('briefDescriptionVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.briefDescriptionVersion.length;
      if(ver<=len && ver>0){
        res.json(record.briefDescriptionVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



