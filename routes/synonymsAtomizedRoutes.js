var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var SynonymsAtomizedVersion = require('../app/models/synonymsAtomized.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var synonyms_atomized_version  = req.body; 
  synonyms_atomized_version._id = mongoose.Types.ObjectId();
  synonyms_atomized_version.created=Date();
  synonyms_atomized_version.element="synonymsAtomized";
  var eleValue = synonyms_atomized_version.synonymsAtomized;
  synonyms_atomized_version = new SynonymsAtomizedVersion(synonyms_atomized_version);

  var id_v = synonyms_atomized_version._id;
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
            var lensynonymsAtomized = data.synonymsAtomizedVersion.length;
            if( lensynonymsAtomized !=0 ){
              var idLast = data.synonymsAtomizedVersion[lensynonymsAtomized-1];
              SynonymsAtomizedVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of synonymsAtomizedVersion:" + err.message));
                }else{
                  var prev = doc.synonymsAtomized;
                  var next = synonyms_atomized_version.synonymsAtomized;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    synonyms_atomized_version.id_record=id_rc;
                    synonyms_atomized_version.version=lensynonymsAtomized+1;
                    callback(null, synonyms_atomized_version);
                  }else{
                    callback(new Error("The data in synonymsAtomized is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              synonyms_atomized_version.id_record=id_rc;
              synonyms_atomized_version.version=1;
              callback(null, synonyms_atomized_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(synonyms_atomized_version, callback){ 
          ver = synonyms_atomized_version.version;
          synonyms_atomized_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, synonyms_atomized_version);
            }
          });
      },
      function(synonyms_atomized_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "synonymsAtomizedVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save SynonymsAtomizedVersion', element: 'synonymsAtomized', version : ver, _id: id_v, id_record : id_rc });
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
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('synonymsAtomizedVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.synonymsAtomizedVersion.length;
      if(ver<=len && ver>0){
        res.json(record.synonymsAtomizedVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};
