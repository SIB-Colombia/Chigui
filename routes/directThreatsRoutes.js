var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var DirectThreatsVersion = require('../app/models/directThreats.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var direct_threats_version  = req.body; 
  direct_threats_version._id = mongoose.Types.ObjectId();
  direct_threats_version.created=Date();
  direct_threats_version.element="directThreats";
  var eleValue = direct_threats_version.directThreats;
  direct_threats_version = new DirectThreatsVersion(direct_threats_version);

  var id_v = direct_threats_version._id;
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
            var lendirectThreats = data.directThreatsVersion.length;
            if( lendirectThreats !=0 ){
              var idLast = data.directThreatsVersion[lendirectThreats-1];
              DirectThreatsVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of directThreatsVersion:" + err.message));
                }else{
                  var prev = doc.directThreats;
                  var next = direct_threats_version.directThreats;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    direct_threats_version.id_record=id_rc;
                    direct_threats_version.version=lendirectThreats+1;
                    callback(null, direct_threats_version);
                  }else{
                    callback(new Error("The data in directThreats is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              direct_threats_version.id_record=id_rc;
              direct_threats_version.version=1;
              callback(null, direct_threats_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(direct_threats_version, callback){ 
          ver = direct_threats_version.version;
          direct_threats_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, direct_threats_version);
            }
          });
      },
      function(direct_threats_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "directThreatsVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save DirectThreatsVersion', element: 'directThreats', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('directThreatsVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.directThreatsVersion.length;
      if(ver<=len && ver>0){
        res.json(record.directThreatsVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};