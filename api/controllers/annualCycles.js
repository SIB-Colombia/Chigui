import mongoose from 'mongoose';
import async from 'async';
import AnnualCyclesVersion from '../models/annualCycles.js';
import add_objects from '../models/additionalModels.js';


function postAnnualCycles(req, res) {
  var annual_cycles_version  = req.body; 
    annual_cycles_version._id = mongoose.Types.ObjectId();
    annual_cycles_version.created=Date();
    annual_cycles_version.element="annualCycles";
    var elementValue = annual_cycles_version.annualCycles;
    annual_cycles_version = new AnnualCyclesVersion(annual_cycles_version);
    var id_v = annual_cycles_version._id;
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
                var lenannualCycles = data.annualCyclesVersion.length;
                if( lenannualCycles !=0 ){
                  var idLast = data.annualCyclesVersion[lenannualCycles-1];
                  AnnualCyclesVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of annualCyclesVersion:" + err.message));
                        }else{
                          var prev = doc.annualCycles;
                            var next = annual_cycles_version.annualCycles;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              annual_cycles_version.id_record=id_rc;
                              annual_cycles_version.version=lenannualCycles+1;
                              callback(null, annual_cycles_version);
                            }else{
                              callback(new Error("The data in annualCycles is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  annual_cycles_version.id_record=id_rc;
                      annual_cycles_version.version=1;
                      callback(null, annual_cycles_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(annual_cycles_version, callback){ 
                ver = annual_cycles_version.version;
                annual_cycles_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, annual_cycles_version);
                  }
                });
            },
            function(annual_cycles_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "annualCyclesVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save AnnualCyclesVersion', element: 'annualCycles', version : ver, _id: id_v, id_record : id_rc });
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

function getAnnualCycles(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    AnnualCyclesVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a AnnualCyclesVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postAnnualCycles,
  getAnnualCycles
};