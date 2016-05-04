var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var EcologicalSignificanceVersion = require('../app/models/ecologicalSignificance.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('ecologicalSignificanceVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.ecologicalSignificanceVersion.length;
      if(ver<=len && ver>0){
        res.json(record.ecologicalSignificanceVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.postVersion = function(req, res) {
  var ecological_significance_version  = req.body; 
  ecological_significance_version._id = mongoose.Types.ObjectId();
  ecological_significance_version.created=Date();
  ecological_significance_version.element="ecologicalSignificance";
  var eleValue = ecological_significance_version.ecologicalSignificance;
  ecological_significance_version = new EcologicalSignificanceVersion(ecological_significance_version);

  var id_v = ecological_significance_version._id;
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
            var lenecologicalSignificance = data.ecologicalSignificanceVersion.length;
            if( lenecologicalSignificance !=0 ){
              var idLast = data.ecologicalSignificanceVersion[lenecologicalSignificance-1];
              EcologicalSignificanceVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of ecologicalSignificanceVersion:" + err.message));
                }else{
                  var prev = doc.ecologicalSignificance;
                  var next = ecological_significance_version.ecologicalSignificance;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    ecological_significance_version.id_record=id_rc;
                    ecological_significance_version.version=lenecologicalSignificance+1;
                    callback(null, ecological_significance_version);
                  }else{
                    callback(new Error("The data in ecologicalSignificance is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              ecological_significance_version.id_record=id_rc;
              ecological_significance_version.version=1;
              callback(null, ecological_significance_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(ecological_significance_version, callback){ 
          ver = ecological_significance_version.version;
          ecological_significance_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, ecological_significance_version);
            }
          });
      },
      function(ecological_significance_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "ecologicalSignificanceVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save EcologicalSignificanceVersion', element: 'ecologicalSignificance', version : ver, _id: id_v, id_record : id_rc });
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