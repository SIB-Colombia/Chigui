var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var LifeCycleVersion = require('../app/models/lifeCycle.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var life_cycle_version  = req.body; 
  life_cycle_version._id = mongoose.Types.ObjectId();
  life_cycle_version.created=Date();
  life_cycle_version.element="lifeCycle";
  var eleValue = life_cycle_version.lifeCycle;
  life_cycle_version = new LifeCycleVersion(life_cycle_version);

  var id_v = life_cycle_version._id;
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
            var lenlifeCycle = data.lifeCycleVersion.length;
            if( lenlifeCycle !=0 ){
              var idLast = data.lifeCycleVersion[lenlifeCycle-1];
              LifeCycleVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of lifeCycleVersion:" + err.message));
                }else{
                  var prev = doc.lifeCycle;
                  var next = life_cycle_version.lifeCycle;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    life_cycle_version.id_record=id_rc;
                    life_cycle_version.version=lenlifeCycle+1;
                    callback(null, life_cycle_version);
                  }else{
                    callback(new Error("The data in lifeCycle is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              life_cycle_version.id_record=id_rc;
              life_cycle_version.version=1;
              callback(null, life_cycle_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(life_cycle_version, callback){ 
          ver = life_cycle_version.version;
          life_cycle_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, life_cycle_version);
            }
          });
      },
      function(life_cycle_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "lifeCycleVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save LifeCycleVersion', element: 'lifeCycle', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('lifeCycleVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.lifeCycleVersion.length;
      if(ver<=len && ver>0){
        res.json(record.lifeCycleVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



