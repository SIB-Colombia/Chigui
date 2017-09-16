var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var EnvironmentalEnvelopeVersion = require('../app/models/environmentalEnvelope.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;;
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('environmentalEnvelopeVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.environmentalEnvelopeVersion.length;
      if(ver<=len && ver>0){
        res.json(record.environmentalEnvelopeVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

exports.postVersion = function(req, res) {
  var environmental_envelope_version  = req.body; 
  environmental_envelope_version._id = mongoose.Types.ObjectId();
  environmental_envelope_version.created=Date();
  environmental_envelope_version.state="accepted";
  var eleValue = environmental_envelope_version.environmentalEnvelope;
  environmental_envelope_version = new EnvironmentalEnvelopeVersion(environmental_envelope_version);

  var id_v = environmental_envelope_version._id;
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
            var lenenvironmentalEnvelope = data.environmentalEnvelopeVersion.length;
            if( lenenvironmentalEnvelope !=0 ){
              var idLast = data.environmentalEnvelopeVersion[lenenvironmentalEnvelope-1];
              EnvironmentalEnvelopeVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of environmentalEnvelopeVersion:" + err.message));
                }else{
                  var prev = doc.environmentalEnvelope;
                  var next = environmental_envelope_version.environmentalEnvelope;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    environmental_envelope_version.id_record=id_rc;
                    environmental_envelope_version.version=lenenvironmentalEnvelope+1;
                    callback(null, environmental_envelope_version);
                  }else{
                    callback(new Error("The data in environmentalEnvelope is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              environmental_envelope_version.id_record=id_rc;
              environmental_envelope_version.version=1;
              callback(null, environmental_envelope_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(environmental_envelope_version, callback){ 
          ver = environmental_envelope_version.version;
          environmental_envelope_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, environmental_envelope_version);
            }
          });
      },
      function(environmental_envelope_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "environmentalEnvelopeVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save EnvironmentalEnvelopeVersion', element: 'environmentalEnvelope', version : ver, _id: id_v, id_record : id_rc });
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