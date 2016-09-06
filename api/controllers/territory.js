import mongoose from 'mongoose';
import async from 'async';
import TerritoryVersion from '../models/territory.js';
import add_objects from '../models/additionalModels.js';


function postTerritory(req, res) {
  var territory_version  = req.body; 
    territory_version._id = mongoose.Types.ObjectId();
    territory_version.created=Date();
    territory_version.element="territory";
    var elementValue = territory_version.territory;
    territory_version = new TerritoryVersion(territory_version);
    var id_v = territory_version._id;
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
                var lenterritory = data.territoryVersion.length;
                if( lenterritory !=0 ){
                  var idLast = data.territoryVersion[lenterritory-1];
                  TerritoryVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of territoryVersion:" + err.message));
                        }else{
                          var prev = doc.territory;
                            var next = territory_version.territory;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              territory_version.id_record=id_rc;
                              territory_version.version=lenterritory+1;
                              callback(null, territory_version);
                            }else{
                              callback(new Error("The data in territory is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  territory_version.id_record=id_rc;
                      territory_version.version=1;
                      callback(null, territory_version);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(territory_version, callback){ 
                ver = territory_version.version;
                territory_version.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, territory_version);
                  }
                });
            },
            function(territory_version, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "territoryVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save TerritoryVersion', element: 'territory', version : ver, _id: id_v, id_record : id_rc });
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

function getTerritory(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    TerritoryVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a TerritoryVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postTerritory,
  getTerritory
};