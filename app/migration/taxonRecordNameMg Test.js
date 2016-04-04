var mongoose = require('mongoose');
var TaxonRecordNameVersion = require('../models/taxonRecordName.js');


var exports = module.exports = {};

exports.postRecord = function(connection, RecordModel, element, id_record) {
  //console.log(element);
  var texSchema = TaxonRecordNameVersion.schema;
  var TaxonRecordNameVersionModel = connection.model('TaxonRecordNameVersion', texSchema );

  var taxon_record_name_version = {}; 
  taxon_record_name_version.taxonRecordName = element; 
  taxon_record_name_version._id = mongoose.Types.ObjectId();

  taxon_record_name_version.id_record=id_record;
  taxon_record_name_version.created=Date();
  var eleValue = taxon_record_name_version.taxonRecordName;
  taxon_record_name_version = new TaxonRecordNameVersionModel(taxon_record_name_version);

  var id_v = taxon_record_name_version._id;
  var id_rc = id_record;
  var ver = 1;
  var ob_ids= new Array();
  ob_ids.push(id_v);

  

  if(typeof  eleValue!=="undefined" && eleValue!=""){
      RecordModel.create({ _id:id_rc, taxonRecordNameVersion: ob_ids },function(err, doc){
        if(err){
          res.send(err);
        }
        taxon_record_name_version.version=1;

        taxon_record_name_version.save(function(err){
          if(err){
            res.send(err);
          }
          console.log({ message: 'Created a new Record and Save TaxonRecordNameVersion', element: 'TaxonRecordName', version : ver, _id: id_v, id_record : id_rc });
        });
      });
  }else{
    console.log({message: "Empty data in version of the element"});
  }
}

