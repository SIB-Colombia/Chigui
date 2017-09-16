var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var LifeFormVersion = require('../app/models/lifeForm.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {}

exports.postVersion = function(req, res) {
  var life_form_version  = req.body; 
  life_form_version._id = mongoose.Types.ObjectId();
  life_form_version.created=Date();
  life_form_version.element="lifeForm";
  var eleValue = life_form_version.lifeForm;
  life_form_version = new LifeFormVersion(life_form_version);

  var id_v = life_form_version._id;
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
            var lenlifeForm = data.lifeFormVersion.length;
            if( lenlifeForm !=0 ){
              var idLast = data.lifeFormVersion[lenlifeForm-1];
              LifeFormVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of lifeFormVersion:" + err.message));
                }else{
                  var prev = doc.lifeForm;
                  var next = life_form_version.lifeForm;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    life_form_version.id_record=id_rc;
                    life_form_version.version=lenlifeForm+1;
                    callback(null, life_form_version);
                  }else{
                    callback(new Error("The data in lifeForm is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              life_form_version.id_record=id_rc;
              life_form_version.version=1;
              callback(null, life_form_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(life_form_version, callback){ 
          ver = life_form_version.version;
          life_form_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err));
            }else{
              callback(null, life_form_version);
            }
          });
      },
      function(life_form_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "lifeFormVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save LifeFormVersion', element: 'lifeForm', version : ver, _id: id_v, id_record : id_rc });
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
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('lifeFormVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      };
      var len=record.lifeFormVersion.length;
      if(ver<=len && ver>0){
        res.json(record.lifeFormVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};
