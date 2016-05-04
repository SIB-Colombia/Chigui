var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var IdentificationKeysVersion = require('../app/models/identificationKeys.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var identification_keys_version  = req.body; 
  identification_keys_version._id = mongoose.Types.ObjectId();
  identification_keys_version.created=Date();
  identification_keys_version.element="identificationKeys";
  var eleValue = identification_keys_version.identificationKeys;
  identification_keys_version = new IdentificationKeysVersion(identification_keys_version);

  var id_v = identification_keys_version._id;
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
            var lenidentificationKeys = data.identificationKeysVersion.length;
            if( lenidentificationKeys !=0 ){
              var idLast = data.identificationKeysVersion[lenidentificationKeys-1];
              IdentificationKeysVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of identificationKeysVersion:" + err.message));
                }else{
                  var prev = doc.identificationKeys;
                  var next = identification_keys_version.identificationKeys;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    identification_keys_version.id_record=id_rc;
                    identification_keys_version.version=lenidentificationKeys+1;
                    callback(null, identification_keys_version);
                  }else{
                    callback(new Error("The data in identificationKeys is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              identification_keys_version.id_record=id_rc;
              identification_keys_version.version=1;
              callback(null, identification_keys_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(identification_keys_version, callback){ 
          ver = identification_keys_version.version;
          identification_keys_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, identification_keys_version);
            }
          });
      },
      function(identification_keys_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "identificationKeysVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save IdentificationKeysVersion', element: 'identificationKeys', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('identificationKeysVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.identificationKeysVersion.length;
      if(ver<=len && ver>0){
        res.json(record.identificationKeysVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};



