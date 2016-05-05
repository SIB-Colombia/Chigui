var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var ReferencesVersion = require('../app/models/references.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var references_version  = req.body; 
  references_version._id = mongoose.Types.ObjectId();
  references_version.created=Date();
  references_version.element="references";
  var eleValue = references_version.references;
  references_version = new ReferencesVersion(references_version);

  var id_v = references_version._id;
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
            var lenreferences = data.referencesVersion.length;
            if( lenreferences !=0 ){
              var idLast = data.referencesVersion[lenreferences-1];
              ReferencesVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of referencesVersion:" + err.message));
                }else{
                  var prev = doc.references;
                  var next = references_version.references;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    references_version.id_record=id_rc;
                    references_version.version=lenreferences+1;
                    callback(null, references_version);
                  }else{
                    callback(new Error("The data in references is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              references_version.id_record=id_rc;
              references_version.version=1;
              callback(null, references_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(references_version, callback){ 
          ver = references_version.version;
          references_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, references_version);
            }
          });
      },
      function(references_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "referencesVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save ReferencesVersion', element: 'references', version : ver, _id: id_v, id_record : id_rc });
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
};

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('referencesVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.referencesVersion.length;
      if(ver<=len && ver>0){
        res.json(record.referencesVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};