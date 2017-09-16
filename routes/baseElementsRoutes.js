var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var BaseElementsVersion = require('../app/models/baseElements.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var base_elements_version  = req.body; 
  base_elements_version._id = mongoose.Types.ObjectId();
  base_elements_version.created=Date();
  base_elements_version.element="baseElements";
  var eleValue = base_elements_version.baseElements;
  base_elements_version = new BaseElementsVersion(base_elements_version);

  var id_v = base_elements_version._id;
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
            var lenbaseElements = data.baseElementsVersion.length;
            if( lenbaseElements !=0 ){
              var idLast = data.baseElementsVersion[lenbaseElements-1];
              BaseElementsVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of baseElementsVersion:" + err.message));
                }else{
                  var prev = doc.baseElements;
                  var next = base_elements_version.baseElements;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    base_elements_version.id_record=id_rc;
                    base_elements_version.version=lenbaseElements+1;
                    callback(null, base_elements_version);
                  }else{
                    callback(new Error("The data in baseElements is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              base_elements_version.id_record=id_rc;
              base_elements_version.version=1;
              callback(null, base_elements_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(base_elements_version, callback){ 
          ver = base_elements_version.version;
          base_elements_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, base_elements_version);
            }
          });
      },
      function(base_elements_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "baseElementsVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save BaseElementsVersion', element: 'baseElements', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('baseElementsVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.baseElementsVersion.length;
      if(ver<=len && ver>0){
        res.json(record.baseElementsVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};
