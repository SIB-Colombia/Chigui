var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var BehaviorVersion = require('../app/models/behavior.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var behavior_version  = req.body; 
  behavior_version._id = mongoose.Types.ObjectId();
  behavior_version.created=Date();
  behavior_version.element="behavior";
  var eleValue = behavior_version.behavior;
  behavior_version = new BehaviorVersion(behavior_version);

  var id_v = behavior_version._id;
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
            var lenBehavior = data.behaviorVersion.length;
            if( lenBehavior !=0 ){
              var idLast = data.behaviorVersion[lenBehavior-1];
              BehaviorVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of BehaviorVersion:" + err.message));
                }else{
                  var prev = doc.behavior;
                  var next = behavior_version.behavior;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    behavior_version.id_record=id_rc;
                    behavior_version.version=lenBehavior+1;
                    callback(null, behavior_version);
                  }else{
                    callback(new Error("The data in behavior is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              behavior_version.id_record=id_rc;
              behavior_version.version=1;
              callback(null, behavior_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(behavior_version, callback){ 
          ver = behavior_version.version;
          behavior_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, behavior_version);
            }
          });
      },
      function(behavior_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "behaviorVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save BehaviorVersion', element: 'behavior', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('behaviorVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.behaviorVersion.length;
      if(ver<=len && ver>0){
        res.json(record.behaviorVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};