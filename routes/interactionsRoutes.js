var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var InteractionsVersion = require('../app/models/interactions.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var interactions_version  = req.body; 
  interactions_version._id = mongoose.Types.ObjectId();
  interactions_version.created=Date();
  interactions_version.element="interactions";
  var eleValue = interactions_version.interactions;
  interactions_version = new InteractionsVersion(interactions_version);

  var id_v = interactions_version._id;
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
            var leninteractions = data.interactionsVersion.length;
            if( leninteractions !=0 ){
              var idLast = data.interactionsVersion[leninteractions-1];
              InteractionsVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of interactionsVersion:" + err.message));
                }else{
                  var prev = doc.interactions;
                  var next = interactions_version.interactions;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    interactions_version.id_record=id_rc;
                    interactions_version.version=leninteractions+1;
                    callback(null, interactions_version);
                  }else{
                    callback(new Error("The data in interactions is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              interactions_version.id_record=id_rc;
              interactions_version.version=1;
              callback(null, interactions_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(interactions_version, callback){ 
          ver = interactions_version.version;
          interactions_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, interactions_version);
            }
          });
      },
      function(interactions_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "interactionsVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save InteractionsVersion', element: 'interactions', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('interactionsVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.interactionsVersion.length;
      if(ver<=len && ver>0){
        res.json(record.interactionsVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};