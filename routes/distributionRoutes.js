var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var DistributionVersion = require('../app/models/distribution.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var distribution_version  = req.body; 
  distribution_version._id = mongoose.Types.ObjectId();
  distribution_version.created=Date();
  distribution_version.element="distribution";
  var eleValue = distribution_version.distribution;
  distribution_version = new DistributionVersion(distribution_version);

  var id_v = distribution_version._id;
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
            var lendistribution = data.distributionVersion.length;
            if( lendistribution !=0 ){
              var idLast = data.distributionVersion[lendistribution-1];
              DistributionVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of distributionVersion:" + err.message));
                }else{
                  var prev = doc.distribution;
                  var next = distribution_version.distribution;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    distribution_version.id_record=id_rc;
                    distribution_version.version=lendistribution+1;
                    callback(null, distribution_version);
                  }else{
                    callback(new Error("The data in distribution is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              distribution_version.id_record=id_rc;
              distribution_version.version=1;
              callback(null, distribution_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(distribution_version, callback){ 
          ver = distribution_version.version;
          distribution_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, distribution_version);
            }
          });
      },
      function(distribution_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "distributionVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save DistributionVersion', element: 'distribution', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('distributionVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.distributionVersion.length;
      if(ver<=len && ver>0){
        res.json(record.distributionVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

