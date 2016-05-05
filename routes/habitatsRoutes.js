var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var HabitatsVersion = require('../app/models/habitats.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('habitatsVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.habitatsVersion.length;
      if(ver<=len && ver>0){
        res.json(record.habitatsVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.postVersion = function(req, res) {
  var habitats_version  = req.body; 
  habitats_version._id = mongoose.Types.ObjectId();
  habitats_version.created=Date();
  habitats_version.element="habitats";
  var elementTemp=req.body.habitats;
  if(typeof  elementTemp!=="undefined" && elementTemp.length!=0){
    habitats_version.habitats=elementTemp;
  }else{
    habitats_version.habitats=req.body.habitat;
  }
  var eleValue = habitats_version.habitats;
  habitats_version = new HabitatsVersion(habitats_version);

  var id_v = habitats_version._id;
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
            var lenhabitats = data.habitatsVersion.length;
            if( lenhabitats !=0 ){
              var idLast = data.habitatsVersion[lenhabitats-1];
              HabitatsVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of habitatsVersion:" + err.message));
                }else{
                  var prev = doc.habitats;
                  var next = habitats_version.habitats;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    habitats_version.id_record=id_rc;
                    habitats_version.version=lenhabitats+1;
                    callback(null, habitats_version);
                  }else{
                    callback(new Error("The data in habitats is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              habitats_version.id_record=id_rc;
              habitats_version.version=1;
              callback(null, habitats_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(habitats_version, callback){ 
          ver = habitats_version.version;
          habitats_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, habitats_version);
            }
          });
      },
      function(habitats_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "habitatsVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save HabitatsVersion', element: 'habitats', version : ver, _id: id_v, id_record : id_rc });
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