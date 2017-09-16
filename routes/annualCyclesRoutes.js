var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var AnnualCyclesVersion = require('../app/models/annualCycles.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var annual_cycles_version  = req.body; 
  annual_cycles_version._id = mongoose.Types.ObjectId();
  annual_cycles_version.created=Date();
  annual_cycles_version.element="annualCycles";
  var elementTemp=req.body.annualCycles;
  if(typeof  elementTemp!=="undefined" && elementTemp.length!=0){
    annual_cycles_version.annualCycles=elementTemp;
  }else{
    annual_cycles_version.annualCycles=req.body.annualCycle;
  }
  var eleValue = annual_cycles_version.annualCycles;
  annual_cycles_version = new AnnualCyclesVersion(annual_cycles_version);

  var id_v = annual_cycles_version._id;
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
            var lenannualCycles = data.annualCyclesVersion.length;
            if( lenannualCycles !=0 ){
              var idLast = data.annualCyclesVersion[lenannualCycles-1];
              AnnualCyclesVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of annualCyclesVersion:" + err.message));
                }else{
                  var prev = doc.annualCycles;
                  var next = annual_cycles_version.annualCycles;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    annual_cycles_version.id_record=id_rc;
                    annual_cycles_version.version=lenannualCycles+1;
                    callback(null, annual_cycles_version);
                  }else{
                    callback(new Error("The data in annualCycles is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              annual_cycles_version.id_record=id_rc;
              annual_cycles_version.version=1;
              callback(null, annual_cycles_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(annual_cycles_version, callback){ 
          ver = annual_cycles_version.version;
          annual_cycles_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, annual_cycles_version);
            }
          });
      },
      function(annual_cycles_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "annualCyclesVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save AnnualCyclesVersion', element: 'annualCycles', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('annualCyclesVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.annualCyclesVersion.length;
      if(ver<=len && ver>0){
        res.json(record.annualCyclesVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};
