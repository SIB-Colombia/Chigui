var express = require('express');
var async = require('async');
var router = express.Router();
var mongoDB = require('../config/server');
var mongoose = require('mongoose');
var TaxonRecordNameVersion = require('../app/models/taxonRecordName.js');
var add_objects = require('../app/models/additionalModels.js');
var cors = require;

var exports = module.exports = {};

exports.postVersion = function(req, res) {
  var taxon_record_name_version  = req.body; 
  taxon_record_name_version._id = mongoose.Types.ObjectId();
  taxon_record_name_version.created=Date();
  taxon_record_name_version.state="accepted";
  taxon_record_name_version.element="taxonRecordName";
  var eleValue = taxon_record_name_version.taxonRecordName;
  taxon_record_name_version = new TaxonRecordNameVersion(taxon_record_name_version);

  var id_v = taxon_record_name_version._id;
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
            var lentaxonRecordName = data.taxonRecordNameVersion.length;
            if( lentaxonRecordName !=0 ){
              var idLast = data.taxonRecordNameVersion[lentaxonRecordName-1];
              TaxonRecordNameVersion.findById(idLast , function (err, doc){
                if(err){
                  callback(new Error("failed getting the last version of taxonRecordNameVersion:" + err.message));
                }else{
                  var prev = doc.taxonRecordName;
                  var next = taxon_record_name_version.taxonRecordName;
                  //if(!compare.isEqual(prev,next)){ //TODO
                  if(true){
                    taxon_record_name_version.id_record=id_rc;
                    taxon_record_name_version.version=lentaxonRecordName+1;
                    callback(null, taxon_record_name_version);
                  }else{
                    callback(new Error("The data in taxonRecordName is equal to last version of this element in the database"));
                  }
                }
              }); 
            }else{
              taxon_record_name_version.id_record=id_rc;
              taxon_record_name_version.version=1;
              callback(null, taxon_record_name_version);
            }
        }else{
          callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
        }
      },
      function(taxon_record_name_version, callback){ 
          ver = taxon_record_name_version.version;
          taxon_record_name_version.save(function(err){
            if(err){
              callback(new Error("failed saving the element version:" + err.message));
            }else{
              callback(null, taxon_record_name_version);
            }
          });
      },
      function(taxon_record_name_version, callback){ 
          add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "taxonRecordNameVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
            res.json({ message: 'Save TaxonRecordNameVersion', element: 'taxonRecordName', version : ver, _id: id_v, id_record : id_rc });
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

exports.postRecord = function(req, res) {
  var taxon_record_name_version  = req.body; 
  taxon_record_name_version._id = mongoose.Types.ObjectId();

  taxon_record_name_version.id_record=mongoose.Types.ObjectId();
  taxon_record_name_version.created=Date();
  taxon_record_name_version.state="accepted";
  taxon_record_name_version.element="taxonRecordName";
  var eleValue = taxon_record_name_version.taxonRecordName;
  taxon_record_name_version = new TaxonRecordNameVersion(taxon_record_name_version);

  var id_v = taxon_record_name_version._id;
  var id_rc = taxon_record_name_version.id_record;
  var ver = 1;
  var ob_ids= new Array();
  ob_ids.push(id_v);

  if(typeof  eleValue!=="undefined" && eleValue!=""){
    add_objects.RecordVersion.count({ _id : id_rc }, function (err, count){
    if(count==0){
      add_objects.RecordVersion.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
        if(err){
          res.status(406);
          res.send(err);
        }
        taxon_record_name_version.version=1;

        taxon_record_name_version.save(function(err){
          if(err){
            res.status(406);
            res.send(err);
          }
          res.json({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
        });
      });
    }else{
      res.status(406);
      res.json({message: "Already exists a Record(Ficha) with id: "+id_rc });
    }
  });
  }else{
    res.status(406);
    res.json({message: "Empty data in version of the element"});
  }
}

exports.getVersion = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  console.log(id_rc);
  console.log(ver);
  add_objects.RecordVersion.findOne({ _id : id_rc }).populate('taxonRecordNameVersion').exec(function (err, record) {
    if(record){
      if (err){
        
        res.send(err);
      };
      var len=record.taxonRecordNameVersion.length;
      if(ver<=len && ver>0){
        res.json(record.taxonRecordNameVersion[ver-1]);
      }else{
        res.json({message: "The number of version is not valid"});
      }
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
  });
};