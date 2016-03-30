var mongoose = require('mongoose');
var MoreInformationVersion = require('../models/moreInformation.js');

var exports = module.exports = {};

exports.postVersion = function(connection, RecordModel, element, id_record) {
  //console.log(element);
  var moreInformationSchema = MoreInformationVersion.schema;
  var MoreInformationVersionModel = connection.model('MoreInformationVersion', moreInformationSchema );

  var more_information_version = {}; 
  more_information_version.moreInformation = element;
  more_information_version._id = mongoose.Types.ObjectId();

  more_information_version.id_record=id_record;
  more_information_version.created=Date();
  var eleValue = more_information_version.moreInformation;
  more_information_version = new MoreInformationVersionModel(more_information_version);

  var id_v = more_information_version._id;
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
       RecordModel.findByIdAndUpdate( id_rc, { $push: { "moreInformationVersion": id_v } },{safe: true, upsert: true},function(err, doc) {
          if (err){
              res.send(err);
          }
          more_information_version.id_record=id_rc;
          more_information_version.version=doc.moreInformationVersion.length+1;
          var ver = more_information_version.version;
          more_information_version.save(function(err){
            if(err){
             res.send(err);
            }
            console.log({ message: 'Save MoreInformationVersion', element: 'moreInformation', version : ver, _id: id_v, id_record : id_rc });
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

