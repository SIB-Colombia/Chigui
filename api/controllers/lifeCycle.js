import mongoose from 'mongoose';
import async from 'async';
import LifeCycleVersion from '../models/lifeCycle.js';
import add_objects from '../models/additionalModels.js';


function postLifeCycle(req, res) {
  var life_cycle  = req.body; 
    life_cycle._id = mongoose.Types.ObjectId();
    life_cycle.created=Date();
    life_cycle.element="lifeCycle";
    var elementValue = life_cycle.lifeCycle;
    life_cycle = new LifeCycleVersion(life_cycle);
    var id_v = life_cycle._id;
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
                var lenlifeCycle = data.lifeCycleVersion.length;
                if( lenlifeCycle !=0 ){
                  var idLast = data.lifeCycleVersion[lenlifeCycle-1];
                  LifeCycleVersion.findById(idLast , function (err, doc){
                    if(err){
                            callback(new Error("failed getting the last version of lifeCycleVersion:" + err.message));
                        }else{
                          var prev = doc.lifeCycle;
                            var next = life_cycle.lifeCycle;
                            //if(!compare.isEqual(prev,next)){ //TODO
                            if(true){
                              life_cycle.id_record=id_rc;
                              life_cycle.version=lenlifeCycle+1;
                              callback(null, life_cycle);
                            }else{
                              callback(new Error("The data in lifeCycle is equal to last version of this element in the database"));
                            }
                        }
                  });
                }else{
                  life_cycle.id_record=id_rc;
                      life_cycle.version=1;
                      callback(null, life_cycle);
                }
              }else{
                  callback(new Error("The Record (Ficha) with id: "+id_rc+" doesn't exist."));
              }
            },
            function(life_cycle, callback){ 
                ver = life_cycle.version;
                life_cycle.save(function(err){
                  if(err){
                      callback(new Error("failed saving the element version:" + err.message));
                  }else{
                      callback(null, life_cycle);
                  }
                });
            },
            function(life_cycle, callback){ 
                add_objects.RecordVersion.findByIdAndUpdate( id_rc, { $push: { "lifeCycleVersion": id_v } },{ safe: true, upsert: true }).exec(function (err, record) {
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
                  res.json({ message: 'Save LifeCycleVersion', element: 'lifeCycle', version : ver, _id: id_v, id_record : id_rc });
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

function getLifeCycle(req, res) {
    var id_rc = req.swagger.params.id.value;
    var version = req.swagger.params.version.value;

    LifeCycleVersion.findOne({ id_record : id_rc, version: version }).exec(function (err, elementVer) {
            if(err){
              res.status(400);
              res.send(err);
            }else{
              if(elementVer){
                res.json(elementVer);
              }else{
                res.status(400);
                res.json({message: "Doesn't exist a LifeCycleVersion with id_record: "+id_rc+" and version: "+version});
              }
            }
    });

}


module.exports = {
  postLifeCycle,
  getLifeCycle
};