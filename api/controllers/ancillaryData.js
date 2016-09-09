import mongoose from 'mongoose';
import async from 'async';
import AncillaryData from '../models/ancillaryData.js';
import add_objects from '../models/additionalModels.js';


function postAncillaryData(req, res) {
  var ancillary_data_version  = req.body; 
    ancillary_data_version._id = mongoose.Types.ObjectId();
    ancillary_data_version.created=Date();
    ancillary_data_version.element="ancillaryData";
    var elementValue = ancillary_data_version.ancillaryData;
    ancillary_data_version = new AncillaryData(ancillary_data_version);
    var id_v = ancillary_data_version._id;
    var id_rc = req.swagger.params.id.value;

    var ob_ids= new Array();
    ob_ids.push(id_v);

    var ver = "";

    if(typeof  id_rc!=="undefined" && id_rc!=""){
      if(typeof  elementValue!=="undefined" && elementValue!=""){
        async.waterfall([
          function(callback){ 
                add_objects.RecordVersion.findById(id_rc , function (err, data){
                  if(err){
                      callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist.:" + err.message));
                  }else{
                      callback(null, data);
                  }
                });
            },
            function(data,callback){
              if(data){
                var lenancillaryData= data.ancillaryDataVersion.length;
                if( lenancillaryData!=0 ){
                  var idLast = data.ancillaryDataVersion[lenancillaryData-1];
                  AncillaryData.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of ancillaryData:" + err.message));
                        }else{
                          var prev = doc.ancillaryData;
                            var next = ancillary_data_version.ancillaryData;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              ancillary_data_version.id_record=id_rc;
                              ancillary_data_version.version=lenancillaryData+1;
                              callback(null, ancillary_data_version);
                            }else{
                              callback(new Error("The data in ancillaryData is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  ancillary_data_version.id_record=id_rc;
                      ancillary_data_version.version=1;
                      callback(null, ancillary_data_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(ancillary_data_version, callback){ 
                ver = ancillary_data_version.version;
                ancillary_data_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, ancillary_data_version);
                  }
                });
            },
            function(ancillary_data_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "ancillaryDataVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
                  if(err){
                      callback(new Error("failed added id to RecordVersion:" + err.message));
                  }else{
                      callback();
                  }
                });
            }
            ],
            function(err, result) {
                if (err) {
                  console.log("Error: "+err);
                  //res.status(406);
                  res.status(400);
                  res.json({ ErrorResponse: {message: ""+err }});
                }else{
                  res.json({ message: 'Save AncillaryData', element: 'ancillaryData', version : ver, _id: id_v, id_record : id_rc });
               }      
            });

      }else{
        //res.status(406);
        res.status(400);
        res.json({message: "Empty data in version of the element"});
      }
    }else{
      //res.status(406);
      res.status(400);
      res.json({message: "The url doesn't have the id for the Record (Ficha)"});
    }

}

function getAncillaryData(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    AncillaryData.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a AncillaryData with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postAncillaryData,
  getAncillaryData
};