var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var AssociatedPartyVersion = require('../app/models/associatedParty.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var associated_party_version  = req.body; 
  associated_party_version._id = mongoose.Types.ObjectId();
  associated_party_version.created=Date();
  associated_party_version.element="associatedParty";
  var eleValue = associated_party_version.associatedParty;
  associated_party_version = new AssociatedPartyVersion(associated_party_version);

  var id_v = associated_party_version._id;
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
            var lenassociatedParty = data.associatedPartyVersion.length;
            if( lenassociatedParty !=0 ){
              var idLast = data.associatedPartyVersion[lenassociatedParty-1];
              AssociatedPartyVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of associatedPartyVersion:" + err.message));
                }else{
                  var prev = doc.associatedParty;
                  var next = associated_party_version.associatedParty;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    associated_party_version.id_record=id_rc;
                    associated_party_version.version=lenassociatedParty+1;
                    callback(null, associated_party_version);
                  }else{
                    callback(new Error("The data in associatedParty is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              associated_party_version.id_record=id_rc;
              associated_party_version.version=1;
              callback(null, associated_party_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(associated_party_version, callback){ 
          ver = associated_party_version.version;
          associated_party_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, associated_party_version);
            }
          });
      },
      function(associated_party_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "associatedPartyVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save AssociatedPartyVersion', element: 'associatedParty', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.associatedPartyVersion.length;
      if(ver<=len && ver>0){
        res.json(record.associatedPartyVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



