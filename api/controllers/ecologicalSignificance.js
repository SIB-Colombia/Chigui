import mongoose from 'mongoose';
import async from 'async';
import EcologicalSignificanceVersion from '../models/ecologicalSignificance.js';
import add_objects from '../models/additionalModels.js';


function postEcologicalSignificance(req, res) {
  var ecological_significance_version  = req.body; 
    ecological_significance_version._id = mongoose.Types.ObjectId();
    ecological_significance_version.created=Date();
    ecological_significance_version.element="ecologicalSignificance";
    var elementValue = ecological_significance_version.ecologicalSignificance;
    ecological_significance_version = new EcologicalSignificanceVersion(ecological_significance_version);
    var id_v = ecological_significance_version._id;
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
                var lenecologicalSignificance= data.ecologicalSignificanceVersion.length;
                if( lenecologicalSignificance!=0 ){
                  var idLast = data.ecologicalSignificanceVersion[lenecologicalSignificance-1];
                  EcologicalSignificanceVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of ecologicalSignificanceVersion:" + err.message));
                        }else{
                          var prev = doc.ecologicalSignificance;
                            var next = ecological_significance_version.ecologicalSignificance;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              ecological_significance_version.id_record=id_rc;
                              ecological_significance_version.version=lenecologicalSignificance+1;
                              callback(null, ecological_significance_version);
                            }else{
                              callback(new Error("The data in ecologicalSignificance is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  ecological_significance_version.id_record=id_rc;
                      ecological_significance_version.version=1;
                      callback(null, ecological_significance_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(ecological_significance_version, callback){ 
                ver = ecological_significance_version.version;
                ecological_significance_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, ecological_significance_version);
                  }
                });
            },
            function(ecological_significance_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "ecologicalSignificanceVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save EcologicalSignificanceVersion', element: 'ecologicalSignificance', version : ver, _id: id_v, id_record : id_rc });
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

function getEcologicalSignificance(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    EcologicalSignificanceVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a EcologicalSignificanceVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postEcologicalSignificance,
  getEcologicalSignificance
};