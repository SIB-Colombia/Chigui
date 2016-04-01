var mongoose = require('mongoose');
var DirectThreatsVersion = require('../models/directThreats.js');

var exports = module.exports = {};

exports.postVersion = function(connection, RecordModel, element, id_record) {
  console.log(element);
  var directThreatsSchema = DirectThreatsVersion.schema;
  var DirectThreatsVersionModel = connection.model('DirectThreatsVersion', directThreatsSchema );

  var direct_threats_version = {}; 
  direct_threats_version.directThreats = element;
  direct_threats_version._id = mongoose.Types.ObjectId();

  direct_threats_version.id_record=id_record;
  direct_threats_version.created=Date();
  var eleValue = direct_threats_version.directThreats;
  direct_threats_version = new DirectThreatsVersionModel(direct_threats_version);

  var id_v = direct_threats_version._id;
  var id_rc = id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  
  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
    RecordModel.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
       RecordModel.findByIdAndUpdate( id_rc, { $push: { "directThreatsVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          direct_threats_version.id_record=id_rc;
          direct_threats_version.version=doc.directThreatsVersion.length+1;
          var ver = direct_threats_version.version;
          direct_threats_version.save(function(err){
            if(err){
             res.send(err);
            }
            console.log({ message: 'Save DirectThreatsVersion', element: 'directThreats', version : ver, _id: id_v, id_record : id_rc });
         });
        });
      }
      }else{
        console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }
   });
   }else{
    console.log({message: "Empty data in version of the element"});
   } 
  }else{
    console.log({message: "The url doesn't have the id for the Record (Ficha)"});
  } 
  
};

