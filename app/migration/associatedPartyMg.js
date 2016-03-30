var mongoose = require('mongoose');
var AssociatedPartyVersion = require('../models/associatedParty.js');

var exports = module.exports = {};

exports.postVersion = function(connection, RecordModel, element, id_record) {
  console.log(element);
  var associatedPartySchema = AssociatedPartyVersion.schema;
  var AssociatedPartyVersionModel = connection.model('AssociatedPartyVersion', associatedPartySchema );

  var associated_party_version = {}; 
  associated_party_version.associatedParty = element;
  associated_party_version._id = mongoose.Types.ObjectId();

  associated_party_version.id_record=id_record;
  associated_party_version.created=Date();
  var eleValue = associated_party_version.associatedParty;
  associated_party_version = new AssociatedPartyVersionModel(associated_party_version);

  var id_v = associated_party_version._id;
  var id_rc = id_record;

  var ob_ids= new Array();
  ob_ids.push(id_v);

  
  if(typeof  id_rc!=="undefined" && id_rc!=""){
    if(typeof  eleValue!=="undefined" && eleValue!=""){
    RecordModel.count({ _id : id_rc }, function (err, count){ 
      if(typeof count!=="undefined"){
      if(count==0){
        console.log({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
      }else{
       RecordModel.findByIdAndUpdate( id_rc, { $push: { "associatedPartyVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          associated_party_version.id_record=id_rc;
          associated_party_version.version=doc.associatedPartyVersion.length+1;
          var ver = associated_party_version.version;
          associated_party_version.save(function(err){
            if(err){
             res.send(err);
            }
            console.log({ message: 'Save AssociatedPartyVersion', element: 'associatedParty', version : ver, _id: id_v, id_record : id_rc });
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

