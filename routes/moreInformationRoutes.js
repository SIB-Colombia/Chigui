var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var MoreInformationVersion = require('../app/models/moreInformation.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

exports.postVersion = function(req, res) {
  var more_information_version  = req.body; 
  more_information_version._id = mongoose.Types.ObjectId();
  more_information_version.created=Date();
  more_information_version.element="moreInformation";
  var eleValue = more_information_version.moreInformation;
  more_information_version = new MoreInformationVersion(more_information_version);

  var id_v = more_information_version._id;
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
            var lenmoreInformation = data.moreInformationVersion.length;
            if( lenmoreInformation !=0 ){
              var idLast = data.moreInformationVersion[lenmoreInformation-1];
              MoreInformationVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of moreInformationVersion:" + err.message));
                }else{
                  var prev = doc.moreInformation;
                  var next = more_information_version.moreInformation;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    more_information_version.id_record=id_rc;
                    more_information_version.version=lenmoreInformation+1;
                    callback(null, more_information_version);
                  }else{
                    callback(new Error("The data in moreInformation is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              more_information_version.id_record=id_rc;
              more_information_version.version=1;
              callback(null, more_information_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(more_information_version, callback){ 
          ver = more_information_version.version;
          more_information_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, more_information_version);
            }
          });
      },
      function(more_information_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "moreInformationVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save MoreInformationVersion', element: 'moreInformation', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('moreInformationVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.moreInformationVersion.length;
      if(ver<=len && ver>0){
        res.json(record.moreInformationVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};