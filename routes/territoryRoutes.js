var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var TerritoryVersion = require('../app/models/territory.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var territory_version  = req.body; 
  territory_version._id = mongoose.Types.ObjectId();
  territory_version.created=Date();
  territory_version.element="territory";
  var eleValue = territory_version.territory;
  territory_version = new TerritoryVersion(territory_version);

  var id_v = territory_version._id;
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
            var lenterritory = data.territoryVersion.length;
            if( lenterritory !=0 ){
              var idLast = data.territoryVersion[lenterritory-1];
              TerritoryVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of territoryVersion:" + err.message));
                }else{
                  var prev = doc.territory;
                  var next = territory_version.territory;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    territory_version.id_record=id_rc;
                    territory_version.version=lenterritory+1;
                    callback(null, territory_version);
                  }else{
                    callback(new Error("The data in territory is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              territory_version.id_record=id_rc;
              territory_version.version=1;
              callback(null, territory_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(territory_version, callback){ 
          ver = territory_version.version;
          territory_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, territory_version);
            }
          });
      },
      function(territory_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "territoryVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save TerritoryVersion', element: 'territory', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('territoryVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.territoryVersion.length;
      if(ver<=len && ver>0){
        res.json(record.territoryVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};

