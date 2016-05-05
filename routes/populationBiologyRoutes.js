var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var PopulationBiologyVersion = require('../app/models/populationBiology.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var population_biology_version  = req.body; 
  population_biology_version._id = mongoose.Types.ObjectId();
  population_biology_version.created=Date();
  population_biology_version.element="populationBiology";
  var eleValue = population_biology_version.populationBiology;
  population_biology_version = new PopulationBiologyVersion(population_biology_version);

  var id_v = population_biology_version._id;
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
            var lenpopulationBiology = data.populationBiologyVersion.length;
            if( lenpopulationBiology !=0 ){
              var idLast = data.populationBiologyVersion[lenpopulationBiology-1];
              PopulationBiologyVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of populationBiologyVersion:" + err.message));
                }else{
                  var prev = doc.populationBiology;
                  var next = population_biology_version.populationBiology;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    population_biology_version.id_record=id_rc;
                    population_biology_version.version=lenpopulationBiology+1;
                    callback(null, population_biology_version);
                  }else{
                    callback(new Error("The data in populationBiology is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              population_biology_version.id_record=id_rc;
              population_biology_version.version=1;
              callback(null, population_biology_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(population_biology_version, callback){ 
          ver = population_biology_version.version;
          population_biology_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, population_biology_version);
            }
          });
      },
      function(population_biology_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "populationBiologyVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save PopulationBiologyVersion', element: 'populationBiology', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('populationBiologyVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.populationBiologyVersion.length;
      if(ver<=len && ver>0){
        res.json(record.populationBiologyVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

