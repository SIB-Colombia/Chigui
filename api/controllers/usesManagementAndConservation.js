import mongoose from 'mongoose';
import async from 'async';
import UsesManagementAndConservationVersion from '../models/usesManagementAndConservation.js';
import add_objects from '../models/additionalModels.js';


function postUsesManagementAndConservation(req, res) {
  var uses_management_conservation_version  = req.body; 
    uses_management_conservation_version._id = mongoose.Types.ObjectId();
    uses_management_conservation_version.created=Date();
    uses_management_conservation_version.version=0;
    uses_management_conservation_version.id_record= mongoose.Types.ObjectId();
    uses_management_conservation_version.element="usesManagementAndConservation";
    var elementValue = uses_management_conservation_version.usesManagementAndConservation;
    uses_management_conservation_version = new UsesManagementAndConservationVersion(uses_management_conservation_version);
    var id_v = uses_management_conservation_version._id;
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
                var lenusesManagementAndConservation = data.usesManagementAndConservationVersion.length;
                if( lenusesManagementAndConservation !=0 ){
                  var idLast = data.usesManagementAndConservationVersion[lenusesManagementAndConservation-1];
                  UsesManagementAndConservationVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of usesManagementAndConservationVersion:" + err.message));
                        }else{
                          var prev = doc.usesManagementAndConservation;
                            var next = uses_management_conservation_version.usesManagementAndConservation;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              uses_management_conservation_version.id_record=mongoose.Types.ObjectId(id_rc);
                              uses_management_conservation_version.version=lenusesManagementAndConservation+1;
                              callback(null, uses_management_conservation_version);
                            }else{
                              callback(new Error("The data in usesManagementAndConservation is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  uses_management_conservation_version.id_record=id_rc;
                      uses_management_conservation_version.version=1;
                      callback(null, uses_management_conservation_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(uses_management_conservation_version, callback){ 
                ver = uses_management_conservation_version.version;
                uses_management_conservation_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, uses_management_conservation_version);
                  }
                });
            },
            function(uses_management_conservation_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "usesManagementAndConservationVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save UsesManagementAndConservationVersion', element: 'usesManagementAndConservation', version : ver, _id: id_v, id_record : id_rc });
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

function getUsesManagementAndConservation(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    UsesManagementAndConservationVersion.findOne({ "id_record" : mongoose.Types.ObjectId(id_rc), version: version }).exec(function (err, elementVer) {
            
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                //if(elementVer.usesManagementAndConservation.usesAtomized){
                if(!(elementVer._doc.usesManagementAndConservation === undefined || elementVer._doc.usesManagementAndConservation === null)){
                  for(var i=0;i<elementVer._doc.usesManagementAndConservation.usesAtomized.length;i++){
                    for(var j=0;j<elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData.length;j++){
                      for(var k=0;k<elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference.length;k++){
                        console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors);
                        console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.constructor);
                        console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.constructor === Array);
                        console.log(!elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.constructor === Array);
                        console.log(!(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.constructor === Array));
                        console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors);
                        console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors.constructor);
                        console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors.constructor === Array);
                        if(!(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.constructor === Array)){
                          console.log("***");
                          console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.split(";"));
                          elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors = elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].authors.split(";");
                        }
                        if(!(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors.constructor === Array)){
                          console.log("!!!");
                          console.log(elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors.split(";"));
                          elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors = elementVer._doc.usesManagementAndConservation.usesAtomized[i].ancillaryData[j].reference[k].editors.split(";");
                        }
                      }
                    }
                  }
                  if(!(elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData === undefined || elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData === null)){
                    for(var i=0;i<elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData.length;i++){
                      for(var j=0;j<elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference.length;j++){
                        if(!(elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].authors.constructor === Array)){
                          console.log("***");
                          console.log(elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].authors.split(";"));
                          elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].authors = elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].authors.split(";");
                        }
                        if(!(elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].editors.constructor === Array)){
                          console.log("!!!");
                          console.log(elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].editors.split(";"));
                          elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].editors = elementVer._doc.usesManagementAndConservation.managementAndConservation.ancillaryData[i].reference[j].editors.split(";");
                        }
                      }
                    }
                  }
                }
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a UsesManagementAndConservationVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postUsesManagementAndConservation,
  getUsesManagementAndConservation
};