
//var mongoosePaginate = require('mongoose-paginate');
import mongoose from 'mongoose';
import async from 'async';
import winston from 'winston';
import TaxonRecordNameVersion from '../models/taxonRecordName.js';
import AssociatedPartyVersion from '../models/associatedParty.js';
import BaseElementsVersion from '../models/baseElements.js';
import CommonNamesAtomizedVersion from '../models/commonNamesAtomized.js';
import SynonymsAtomizedVersion from '../models/synonymsAtomized.js';
import LifeCycleVersion from '../models/lifeCycle.js';
import LifeFormVersion from '../models/lifeForm.js';
import IdentificationKeysVersion from '../models/identificationKeys.js';
import FullDescriptionVersion from '../models/fullDescription.js';
import BriefDescriptionVersion from '../models/briefDescription.js';
import AbstractVersion from '../models/abstract.js';
import HierarchyVersion from '../models/hierarchy.js';
import ReproductionVersion from '../models/reproduction.js';
import AnnualCyclesVersion from '../models/annualCycles.js';
import FeedingVersion from '../models/feeding.js';
import DispersalVersion from '../models/dispersal.js';
import BehaviorVersion from '../models/behavior.js';
import InteractionsVersion from '../models/interactions.js';
import MolecularDataVersion from '../models/molecularData.js';
import MigratoryVersion from '../models/migratory.js';
import HabitatsVersion from '../models/habitats.js';
import DistributionVersion from '../models/distribution.js';
import TerritoryVersion from '../models/territory.js';
import PopulationBiologyVersion from '../models/populationBiology.js';
import MoreInformationVersion from '../models/moreInformation.js';
import ThreatStatusVersion from '../models/threatStatus.js';
import LegislationVersion from '../models/legislation.js';
import UsesManagementAndConservationVersion from '../models/usesManagementAndConservation.js';
import DirectThreatsVersion from '../models/directThreats.js';
import AncillaryDataVersion from '../models/ancillaryData.js';
import EndemicAtomizedVersion from '../models/endemicAtomized.js';
import ReferencesVersion from '../models/references.js';
import EnvironmentalEnvelopeVersion from '../models/environmentalEnvelope.js';
import EcologicalSignificanceVersion from '../models/ecologicalSignificance.js';
import InvasivenessVersion from '../models/invasiveness.js';
import add_objects from '../models/additionalModels.js';

//winston.add(winston.transports.File, { filename: 'chigui.log' });


/*
  Returns the last version of a record according to id

  Param 1: isGeoreferenced (boolean), if true returns the count of georeferenced occurrences
 */
function lastRecord(req, res) {

  var RecordVersion = mongoose.model('RecordVersion').schema;
  var id_rc=req.swagger.params.id.value;
  var ver=req.params.version;
  var lastRec={};

  /*
  mongoose.connect('mongodb://localhost:27017/catalogoDb', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
  });
  */
  
    add_objects.RecordVersion.findOne({ _id : id_rc }).exec(function (err, record) {
      if (err){
        res.send(err);
      }
      lastRec._id=record._id;
      //var lenAsPar=record.associatedPartyVersion.length;
      //var lenBasEl=record.baseElementsVersion.length;
      //var lenComNameAt=record.commonNamesAtomizedVersion.length;
      //var lenSyAt=record.synonymsAtomizedVersion.length;
      //var lenTaxRecNam=record.taxonRecordNameVersion.length;
      //var lenLifCyc= record.lifeCycleVersion.length;
      //var lenLifFor= record.lifeFormVersion.length; 
      //var lenIdeKey= record.identificationKeysVersion.length;
      //var lenFulDes= record.fullDescriptionVersion.length;
      //var lenBrfDes= record.briefDescriptionVersion.length;
      //var lenAbs= record.abstractVersion.length;
      //var lenHie= record.hierarchyVersion.length;
      //var lenRep= record.reproductionVersion.length; 
      //var lenAnnCyc= record.annualCyclesVersion.length;
      //var lenFed= record.feedingVersion.length;
      //var lenDis= record.dispersalVersion.length;
      //var lenBeh= record.behaviorVersion.length; 
      //var lenInt=record.interactionsVersion.length;
      //var lenMolDat=record.molecularDataVersion.length; 
      //var lenMig = record.migratoryVersion.length; 
      //var lenHab = record.habitatsVersion.length; 
      //var lenDistr = record.distributionVersion.length; 
      //var lenTerr = record.territoryVersion.length; 
      //var lenPopBio = record.populationBiologyVersion.length; 
      //var lenMorInf = record.moreInformationVersion.length; 
      //var lenThrSta = record.threatStatusVersion.length; 
      //var lenLegs = record.legislationVersion.length;
      //var lenUseCon = record.usesManagementAndConservationVersion.length;
      //var lenDirThr = record.directThreatsVersion.length;
      //var lenAncDat = record.ancillaryDataancillaryDataVersion.length;
      //var lenEndAt = record.endemicAtomizedVersion.length;
      //var lenRefe = record.refancillaryDataerencesVersion.length; 
      //var lenEnv = record.environmentalEnvelopeVersion.length;
      //var lenEcol = record.ecologicalSignificanceVersion.length;
      //var lenInva = record.invasivenessVersion.length;
      async.waterfall([
        function(callback){
          AssociatedPartyVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get AssociatedParty element for the record with id: "+id_rc+" : " + err.message));
             }else{ 
              if(elementVer){
                lastRec.associatedParty=elementVer.associatedParty;
              }
              callback();
            }
          });
        },
        /*
        function(callback){
          BaseElementsVersion.findOne({ id_record : id_rc, version: lenBasEl }).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get BaseElements element for the record with id: "+id_rc+" : " + err.message));
            }else{ 
              if(elementVer){
                lastRec.baseElements = elementVer.baseElements;
              }
              callback();
            }
          });
        },*/
        function(callback){
          CommonNamesAtomizedVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get CommonNamesAtomized element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.commonNamesAtomized = elementVer.commonNamesAtomized;
              }
              callback();
            }
          });
        },
        function(callback){
          SynonymsAtomizedVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
             if(err){
              callback(new Error("Error to get SynonymsAtomized element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.synonymsAtomized = elementVer.synonymsAtomized;
              }
              callback();
            }
          });
        },
        function(callback){
          /*
          TaxonRecordNameVersion.findOne({ id_record : id_rc, version: lenTaxRecNam }).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get TaxonRecordName element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.taxonRecordName = elementVer.taxonRecordName;
              }
              callback();
            }
          });
          */
          TaxonRecordNameVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get TaxonRecordName element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.taxonRecordName = elementVer.taxonRecordName;
              }
              callback();
            }
          });
        },
        function(callback){
          LifeCycleVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get LifeCycle element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.lifeCycle = elementVer.lifeCycle;
              }
              callback();
            }
          });
        },
        function(callback){
          LifeFormVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get LifeForm element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.lifeForm = elementVer.lifeForm;
              }
              callback();
            }
          });
        },
        function(callback){
          IdentificationKeysVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get IdentificationKeys element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.identificationKeys=elementVer.identificationKeys;
              }
              callback();
            }
          });
        },
        function(callback){
          FullDescriptionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get FullDescription element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.fullDescription = elementVer.fullDescription;
              }
              callback();
            }
          });
        },
        function(callback){
          BriefDescriptionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get BriefDescription element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.briefDescription=elementVer.briefDescription;
              }
              callback();
            }
          });
        },
        function(callback){
          AbstractVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Abstract element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.abstract = elementVer.abstract;
              }
              callback();
            }
          });
        },
        function(callback){
          HierarchyVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Hierarchy element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.hierarchy=elementVer.hierarchy;
              }
              callback();
            }
          });
        },
        function(callback){
          ReproductionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Reproduction element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.reproduction = elementVer.reproduction;
              }
              callback();
            }
          });
        },
        function(callback){
          AnnualCyclesVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get AnnualCycles element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.annualCycles = elementVer.annualCycles;
              }
              callback();
            }
          });
        },
        function(callback){
          FeedingVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Feeding element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.feeding = elementVer.feeding;
              }
              callback();
            }
          });
        },
        function(callback){
          DispersalVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Dispersal element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.dispersal = elementVer.dispersal;
              }
              callback();
            }
          });
        },
        function(callback){
          BehaviorVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Behavior element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.behavior = elementVer.behavior;
              }
              callback();
            }
          });
        },
        function(callback){
          InteractionsVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Interactions element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.interactions = elementVer.interactions;
              }
              callback();
            }
          });
        },
        function(callback){
          MolecularDataVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get MolecularData element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.molecularData = elementVer.molecularData;
              }
              callback();
            }
          });
        },
        function(callback){
          MigratoryVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Migratory element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.migratory = elementVer.migratory;
              }
              callback();
            }
          });
        },
        function(callback){
          HabitatsVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Habitats element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.habitats = elementVer.habitats;
              }
              callback();
            }
          });
        },
        function(callback){
          DistributionVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Distribution element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.distribution = elementVer.distribution;
              }
              callback();
            }
          });
        },
        function(callback){
          TerritoryVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Territory element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.territory = elementVer.territory;
              }
              callback();
            }
          });
        },
        function(callback){
          PopulationBiologyVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get PopulationBiology element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.populationBiology = elementVer.populationBiology;
              }
              callback();
            }
          });
        },
        function(callback){
          MoreInformationVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get PopulationBiology element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.moreInformation = elementVer.moreInformation;
              }
              callback();
            }
          });
        },
        function(callback){
          ThreatStatusVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get ThreatStatus element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.threatStatus = elementVer.threatStatus;
              }
              callback();
            }
          });
        },
        function(callback){
          LegislationVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Legislation element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.legislation = elementVer.legislation;
              }
              callback();
            }
          });
        },
        function(callback){
          console.log(id_rc);
          UsesManagementAndConservationVersion.findOne({ "id_record" : mongoose.Types.ObjectId(id_rc), state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get UsesManagementAndConservation element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.usesManagementAndConservation = elementVer._doc.usesManagementAndConservation;
              }
              callback();
            }
          });
        },
        function(callback){
          DirectThreatsVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get DirectThreats element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.directThreats = elementVer.directThreats;
              }
              callback();
            }
          });
        },
        function(callback){
          AncillaryDataVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get AncillaryData element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.ancillaryData = elementVer.ancillaryData;
              }
              callback();
            }
          });
        },
        function(callback){
          EndemicAtomizedVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get EndemicAtomized element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.endemicAtomized = elementVer.endemicAtomized;
              }
              callback();
            }
          });
        },
        function(callback){
          ReferencesVersion.findOne({ "id_record" : mongoose.Types.ObjectId(id_rc), state: "accepted" }).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get References element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.references = elementVer.references;
              }
              callback();
            }
          });
        },
        function(callback){
          EnvironmentalEnvelopeVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get EnvironmentalEnvelope element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.environmentalEnvelope = elementVer.environmentalEnvelope;
              }
              callback();
            }
          });
        },
        function(callback){
          EcologicalSignificanceVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get EcologicalSignificance element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.ecologicalSignificance = elementVer.ecologicalSignificance;
              }
              callback();
            }
          });
        },
        function(callback){
          InvasivenessVersion.findOne({ id_record : id_rc, state: "accepted" }).sort({created: -1}).exec(function (err, elementVer) {
            if(err){
              callback(new Error("Error to get Invasiveness element for the record with id: "+id_rc+" : " + err.message));
            }else{
              if(elementVer){
                lastRec.invasiveness = elementVer.invasiveness;
              }
              callback();
            }
          });
        },
        ],function(err, result) {
          if (err) {
            console.log("Error: "+err);
            winston.error("message: " + err );
            res.status(406);
            res.json({ message: ""+err });
          }else{
            winston.info('info', 'Get Record with _id: ' + id_rc);
            res.json(lastRec);
          }
        });
    });
};

/*
  Returns count of occurrences according to query parameters

  Param 1: isGeoreferenced (boolean), if true returns the count of georeferenced occurrences
 */
function occurrenceCount(req, res) {
  const isGeoreferenced = {
    bool: {
      must: {
        exists: {
          field: 'location'
        }
      }
    }
  };

  const isNotGeoreferenced = {
    bool: {
      must_not: {
        exists: {
          field: 'location'
        }
      }
    }
  };

  const query = {
    query: {
      bool: {
        should: [isGeoreferenced]
      }
    }
  };

  const onlyGeoreferenced = req.swagger.params.isGeoreferenced.value || false;

  if (!onlyGeoreferenced) {
    query.query.bool.should.push(isNotGeoreferenced);
  }

  client.count({
    index: 'sibdataportal',
    type: 'occurrence',
    body: query
  }, (err, response) => {
    // this sends back a JSON response which is a single string
    res.json({
      count: response.count
    });
  });
}

/*
  Returns occurrences and facets data according to params request

  Param facet: type string, name of element used for aggregation
 */
function search(req, res) {
  let countAndQueries = 1;

  const from = ((req.swagger.params.page.value) ? req.swagger.params.page.value : 0)
    * ((req.swagger.params.size.value) ? req.swagger.params.size.value : 10);
  // Root query for ES
  const query = {
    from,
    size: (req.swagger.params.size.value) ? req.swagger.params.size.value : 10,
    query: {
      bool: {
        must: [
          {
            query_string: {
              query: '*'
            }
          }
        ]
      }
    },
    aggs: {}
  };

  // If query general condition
  if (req.swagger.params.q.value) {
    query.query.bool.must[0].query_string.query = req.swagger.params.q.value;
  }

  // If wildcard queries
  if (req.swagger.params.kingdomName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.kingdomName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.kingdom_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.phylumName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.phylumName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.phylum_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.className.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.className.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.class_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.orderName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.orderName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.order_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.familyName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.familyName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.family_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.genusName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.genusName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.genus_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.speciesName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.speciesName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.species_name.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.specificEpithetName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.specificEpithetName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.specific_epithet.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }
  if (req.swagger.params.infraspecificEpithetName.value) {
    query.query.bool.must[countAndQueries] = {
      bool: {
        should: []
      }
    };
    let counter = 0;
    req.swagger.params.infraspecificEpithetName.value.forEach(value => {
      query.query.bool.must[countAndQueries].bool.should[counter] = {
        wildcard: {
          'taxonomy.infraspecific_epithet.exactWords': `*${value}*`
        }
      };
      counter++;
    });
    countAndQueries++;
  }

  // If facets query param construct the query for ES
  if (req.swagger.params.facet.value) {
    req.swagger.params.facet.value.forEach(value => {
      if (value === 'scientificName') {
        query.aggs.scientificName = {
          terms: {
            field: 'canonical.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'kingdom') {
        query.aggs.kingdom = {
          terms: {
            field: 'taxonomy.kingdom_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'phylum') {
        query.aggs.phylum = {
          terms: {
            field: 'taxonomy.phylum_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'class') {
        query.aggs.class = {
          terms: {
            field: 'taxonomy.class_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'order') {
        query.aggs.order = {
          terms: {
            field: 'taxonomy.order_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'family') {
        query.aggs.family = {
          terms: {
            field: 'taxonomy.family_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'genus') {
        query.aggs.genus = {
          terms: {
            field: 'taxonomy.genus_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'specie') {
        query.aggs.specie = {
          terms: {
            field: 'taxonomy.species_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'specific_epithet') {
        query.aggs.specific_epithet = {
          terms: {
            field: 'taxonomy.specific_epithet.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'infraspecific_epithet') {
        query.aggs.infraspecific_epithet = {
          terms: {
            field: 'taxonomy.infraspecific_epithet.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'country') {
        query.aggs.country = {
          terms: {
            field: 'country_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'department') {
        query.aggs.department = {
          terms: {
            field: 'department_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'county') {
        query.aggs.county = {
          terms: {
            field: 'county_name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          },
          aggs: {
            department: {
              terms: {
                field: 'department_name.untouched',
                size: 10,
                shard_size: 100000
              }
            }
          }
        };
      }
      if (value === 'habitat') {
        query.aggs.habitat = {
          terms: {
            field: 'habitat.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'basis_of_record') {
        query.aggs.basis_of_record = {
          terms: {
            field: 'basis_of_record.name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'collection_name') {
        query.aggs.collection_name = {
          terms: {
            field: 'collection.name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'provider_name') {
        query.aggs.provider_name = {
          terms: {
            field: 'provider.name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
      if (value === 'resource_name') {
        query.aggs.resource_name = {
          terms: {
            field: 'resource.name.untouched',
            size: (req.swagger.params.facetLimit.value) ? req.swagger.params.facetLimit.value : 10,
            shard_size: 100000
          }
        };
      }
    });
    query.size = 0;
  }

  client.search({
    index: 'sibdataportal',
    type: 'occurrence',
    body: query
  }, (err, response) => {
    if (err) {
      res.status(400).json({
        message: 'Error searching occurrence data.',
        description: err.message
      });
    } else {
      // Create facets and results array
      const facets = [];
      const results = [];

      // Fill if aggregations exits
      if (response.aggregations) {
        Object.keys(response.aggregations).forEach(key => {
          facets.push({
            field: key,
            counts: response.aggregations[key].buckets
          });
        });
      }

      // Fill if results exits
      if (response.hits.hits) {
        response.hits.hits.forEach(occurrence => {
          results.push(occurrence._source);
        });
      }

      // this sends back a JSON response
      res.json({
        offset: (req.swagger.params.page.value) ? req.swagger.params.page.value : 0,
        size: (req.swagger.params.size.value) ? req.swagger.params.size.value : 10,
        count: response.hits.total,
        facets,
        results
      });
    }
  });
}

module.exports = {
  occurrenceCount,
  search,
  lastRecord
};
