var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var FeedingVersion = require('../app/models/feeding.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var feeding_version  = req.body; 
  feeding_version._id = mongoose.Types.ObjectId();
  feeding_version.created=Date();
  feeding_version.element="feeding";
  var eleValue = feeding_version.feeding;
  feeding_version = new FeedingVersion(feeding_version);

  var id_v = feeding_version._id;
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
            var lenfeeding = data.feedingVersion.length;
            if( lenfeeding !=0 ){
              var idLast = data.feedingVersion[lenfeeding-1];
              FeedingVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of feedingVersion:" + err.message));
                }else{
                  var prev = doc.feeding;
                  var next = feeding_version.feeding;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    feeding_version.id_record=id_rc;
                    feeding_version.version=lenfeeding+1;
                    callback(null, feeding_version);
                  }else{
                    callback(new Error("The data in feeding is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              feeding_version.id_record=id_rc;
              feeding_version.version=1;
              callback(null, feeding_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(feeding_version, callback){ 
          ver = feeding_version.version;
          feeding_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, feeding_version);
            }
          });
      },
      function(feeding_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "feedingVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save FeedingVersion', element: 'feeding', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('feedingVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.feedingVersion.length;
      if(ver<=len && ver>0){
        res.json(record.feedingVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};