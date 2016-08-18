
//var mongoosePaginate = require('mongoose-paginate');
import mongoose from 'mongoose';
import async from 'async';
import TaxonRecordNameVersion from '../app/models/taxonRecordName.js';
import AssociatedPartyVersion from '../app/models/associatedParty.js';
import add_objects from '../app/models/additionalModels.js';
import RecordVersion = require('mongoose').model('RecordVersion').schema; //*******
/*
import elasticsearch from 'elasticsearch';
import { config } from '../../config/application-config';
const debug = require('debug')('dataportal-api:occurrences');
*/

exports.getRecordLast = function(req, res) {
  var id_rc=req.params.id_record;
  var ver=req.params.version;
  var lastRec={};

    add_objects.RecordVersion.findOne({ _id : id_rc }).exec(function (err, record) {
      if (err){
        res.send(err);
      }
      lastRec._id=record._id;
      var lenAsPar=record.associatedPartyVersion.length;
      var lenBasEl=record.baseElementsVersion.length;
      var lenComNameAt=record.commonNamesAtomizedVersion.length;
      var lenSyAt=record.synonymsAtomizedVersion.length;
      var lenTaxRecNam=record.taxonRecordNameVersion.length;
      var lenLifCyc= record.lifeCycleVersion.length;
      var lenLifFor= record.lifeFormVersion.length; 
      var lenIdeKey= record.identificationKeysVersion.length;
      var lenFulDes= record.fullDescriptionVersion.length;
      var lenBrfDes= record.briefDescriptionVersion.length;
      var lenAbs= record.abstractVersion.length;
      var lenHie= record.hierarchyVersion.length;
      var lenRep= record.reproductionVersion.length; 
      var lenAnnCyc= record.annualCyclesVersion.length;
      var lenFed= record.feedingVersion.length;
      var lenDis= record.dispersalVersion.length;
      var lenBeh= record.behaviorVersion.length; 
      var lenInt=record.interactionsVersion.length;
      var lenMolDat=record.molecularDataVersion.length; 
      var lenMig = record.migratoryVersion.length; 
      var lenHab = record.habitatsVersion.length; 
      var lenDistr = record.distributionVersion.length; 
      var lenTerr = record.territoryVersion.length; 
      var lenPopBio = record.populationBiologyVersion.length; 
      var lenMorInf = record.moreInformationVersion.length; 
      var lenThrSta = record.threatStatusVersion.length; 
      var lenLegs = record.legislationVersion.length;
      var lenUseCon = record.usesManagementAndConservationVersion.length;
      var lenDirThr = record.directThreatsVersion.length;
      var lenAncDat = record.ancillaryDataVersion.length;
      var lenEndAt = record.endemicAtomizedVersion.length;
      var lenRefe = record.referencesVersion.length; 
      var lenEnv = record.environmentalEnvelopeVersion.length;
      var lenEcol = record.ecologicalSignificanceVersion.length;
      var lenInva = record.invasivenessVersion.length;
      async.waterfall([
        function(callback){
          AssociatedPartyVersion.findOne({ id_record : id_rc, version: lenAsPar }).exec(function (err, asparty) {
            lastRec.associatedParty=record.associatedPartyVersion[lenAsPar-1].associatedParty;
          });
        }
        ],function(err, result) {
          if (err) {
            console.log("Error: "+err);
            res.status(406);
            res.json({ message: ""+err });
          }else{
            res.json({ message: 'Save AbstractVersion', element: 'abstract', version : ver, _id: id_v, id_record : id_rc });
          }
        });
    });

    add_objects.RecordVersion.findOne({ _id : id_rc }).populate('associatedPartyVersion baseElementsVersion commonNamesAtomizedVersion synonymsAtomizedVersion taxonRecordNameVersion lifeCycleVersion lifeFormVersion identificationKeysVersion fullDescriptionVersion briefDescriptionVersion abstractVersion hierarchyVersion reproductionVersion annualCyclesVersion feedingVersion dispersalVersion behaviorVersion interactionsVersion molecularDataVersion migratoryVersion habitatsVersion distributionVersion territoryVersion populationBiologyVersion moreInformationVersion threatStatusVersion legislationVersion usesManagementAndConservationVersion directThreatsVersion ancillaryDataVersion endemicAtomizedVersion referencesVersion environmentalEnvelopeVersion ecologicalSignificanceVersion invasivenessVersion').exec(function (err, record) {
    if(record){
      if (err){
        res.send(err);
      }
      lastRec._id=record._id;
      var lenAsPar=record.associatedPartyVersion.length;
      var lenBasEl=record.baseElementsVersion.length;
      var lenComNameAt=record.commonNamesAtomizedVersion.length;
      var lenSyAt=record.synonymsAtomizedVersion.length;
      var lenTaxRecNam=record.taxonRecordNameVersion.length;
      var lenLifCyc= record.lifeCycleVersion.length;
      var lenLifFor= record.lifeFormVersion.length; 
      var lenIdeKey= record.identificationKeysVersion.length;
      var lenFulDes= record.fullDescriptionVersion.length;
      var lenBrfDes= record.briefDescriptionVersion.length;
      var lenAbs= record.abstractVersion.length;
      var lenHie= record.hierarchyVersion.length;
      var lenRep= record.reproductionVersion.length; 
      var lenAnnCyc= record.annualCyclesVersion.length;
      var lenFed= record.feedingVersion.length;
      var lenDis= record.dispersalVersion.length;
      var lenBeh= record.behaviorVersion.length; 
      var lenInt=record.interactionsVersion.length;
      var lenMolDat=record.molecularDataVersion.length; 
      var lenMig = record.migratoryVersion.length; 
      var lenHab = record.habitatsVersion.length; 
      var lenDistr = record.distributionVersion.length; 
      var lenTerr = record.territoryVersion.length; 
      var lenPopBio = record.populationBiologyVersion.length; 
      var lenMorInf = record.moreInformationVersion.length; 
      var lenThrSta = record.threatStatusVersion.length; 
      var lenLegs = record.legislationVersion.length;
      var lenUseCon = record.usesManagementAndConservationVersion.length;
      var lenDirThr = record.directThreatsVersion.length;
      var lenAncDat = record.ancillaryDataVersion.length;
      var lenEndAt = record.endemicAtomizedVersion.length;
      var lenRefe = record.referencesVersion.length; 
      var lenEnv = record.environmentalEnvelopeVersion.length;
      var lenEcol = record.ecologicalSignificanceVersion.length;
      var lenInva = record.invasivenessVersion.length;


    if(typeof record.associatedPartyVersion[lenAsPar-1]!=="undefined"){
      lastRec.associatedParty=record.associatedPartyVersion[lenAsPar-1].associatedParty;
    }

    if(typeof record.baseElementsVersion[lenBasEl-1]!=="undefined"){
      lastRec.baseElements=record.baseElementsVersion[lenBasEl-1].baseElements;
    }

    if(typeof record.commonNamesAtomizedVersion[lenComNameAt-1]!=="undefined"){
      lastRec.commonNamesAtomized=record.commonNamesAtomizedVersion[lenComNameAt-1].commonNamesAtomized;
    }

    if(typeof record.synonymsAtomizedVersion[lenSyAt-1]!=="undefined"){
      lastRec.synonymsAtomized=record.synonymsAtomizedVersion[lenSyAt-1].synonymsAtomized;
    }

    if(typeof record.taxonRecordNameVersion[lenTaxRecNam-1]!=="undefined"){
      lastRec.taxonRecordName=record.taxonRecordNameVersion[lenTaxRecNam-1].taxonRecordName;
    }

    if(typeof record.lifeCycleVersion[lenLifCyc-1]!=="undefined"){
      lastRec.lifeCycle=record.lifeCycleVersion[lenLifCyc-1].lifeCycle;
    }

    if(typeof record.lifeFormVersion[lenLifFor-1]!=="undefined"){
      lastRec.lifeForm=record.lifeFormVersion[lenLifFor-1].lifeForm;
    }

    if(typeof record.identificationKeysVersion[lenIdeKey-1]!=="undefined"){
      lastRec.identificationKeys=record.identificationKeysVersion[lenIdeKey-1].identificationKeys;
    }

    if(typeof record.fullDescriptionVersion[lenFulDes-1]!=="undefined"){
      lastRec.fullDescription=record.fullDescriptionVersion[lenFulDes-1].fullDescription;
    }

    if(typeof record.briefDescriptionVersion[lenBrfDes-1]!=="undefined"){
      lastRec.briefDescription=record.briefDescriptionVersion[lenBrfDes-1].briefDescription;
    }

    if(typeof record.abstractVersion[lenAbs-1]!=="undefined"){
      lastRec.abstract=record.abstractVersion[lenAbs-1].abstract;
    }

    if(typeof record.hierarchyVersion[lenHie-1]!=="undefined"){
      lastRec.hierarchy=record.hierarchyVersion[lenHie-1].hierarchy;
    }

    if(typeof record.reproductionVersion[lenRep-1]!=="undefined"){
      lastRec.reproduction=record.reproductionVersion[lenRep-1].reproduction;
    }

    if(typeof record.annualCyclesVersion[lenAnnCyc-1]!=="undefined"){
      lastRec.annualCycles=record.annualCyclesVersion[lenAnnCyc-1].annualCycles;
    }

    if(typeof record.feedingVersion[lenFed-1]!=="undefined"){
      lastRec.feeding=record.feedingVersion[lenFed-1].feeding;
    }

    if(typeof record.dispersalVersion[lenDis-1]!=="undefined"){
      lastRec.dispersal=record.dispersalVersion[lenDis-1].dispersal;
    }

    if(typeof record.behaviorVersion[lenBeh-1]!=="undefined"){
      lastRec.behavior=record.behaviorVersion[lenBeh-1].behavior;
    }

    if(typeof record.interactionsVersion[lenInt-1]!=="undefined"){
      lastRec.interactions=record.interactionsVersion[lenInt-1].interactions;
    }

    if(typeof record.molecularDataVersion[lenMolDat-1]!=="undefined"){
      lastRec.molecularData=record.molecularDataVersion[lenMolDat-1].molecularData;
    }

    if(typeof record.migratoryVersion[lenMig-1]!=="undefined"){
      lastRec.migratory=record.migratoryVersion[lenMig-1].migratory;
    }

    if(typeof record.habitatsVersion[lenHab-1]!=="undefined"){
      lastRec.habitats=record.habitatsVersion[lenHab-1].habitats;
    }

    if(typeof record.distributionVersion[lenDistr-1]!=="undefined"){
      lastRec.distribution=record.distributionVersion[lenDistr-1].distribution;
    }

    if(typeof record.territoryVersion[lenTerr-1]!=="undefined"){
      lastRec.territory=record.territoryVersion[lenTerr-1].territory;
    }

    if(typeof record.populationBiologyVersion[lenPopBio-1]!=="undefined"){
      lastRec.populationBiology=record.populationBiologyVersion[lenPopBio-1].populationBiology;
    }

    if(typeof record.moreInformationVersion[lenMorInf-1]!=="undefined"){
      lastRec.moreInformation=record.moreInformationVersion[lenMorInf-1].moreInformation;
    }

    if(typeof record.threatStatusVersion[lenThrSta-1]!=="undefined"){
      lastRec.threatStatus=record.threatStatusVersion[lenThrSta-1].threatStatus;
    }
 
    if(typeof record.legislationVersion[lenLegs-1]!=="undefined"){
      lastRec.legislation=record.legislationVersion[lenLegs-1].legislation;
    }

    if(typeof record.usesManagementAndConservationVersion[lenUseCon-1]!=="undefined"){
      lastRec.usesManagementAndConservation=record.usesManagementAndConservationVersion[lenUseCon-1]._doc.usesManagementAndConservation;
    }
    
    if(typeof record.directThreatsVersion[lenDirThr-1]!=="undefined"){
      lastRec.directThreats=record.directThreatsVersion[lenDirThr-1].directThreats;
    }

    if(typeof record.ancillaryDataVersion[lenAncDat-1]!=="undefined"){
      lastRec.ancillaryData=record.ancillaryDataVersion[lenAncDat-1].ancillaryData;
    }

    if(typeof record.endemicAtomizedVersion[lenEndAt-1]!=="undefined"){
      lastRec.endemicAtomized=record.endemicAtomizedVersion[lenEndAt-1].endemicAtomized;
    }

    if(typeof record.referencesVersion[lenRefe-1]!=="undefined"){
      lastRec.references=record.referencesVersion[lenRefe-1].references;
    } 

    if(typeof record.environmentalEnvelopeVersion[lenEnv-1]!=="undefined"){
      lastRec.environmentalEnvelope=record.environmentalEnvelopeVersion[lenEnv-1].environmentalEnvelope;
    }

    if(typeof record.ecologicalSignificanceVersion[lenEcol-1]!=="undefined"){
      lastRec.ecologicalSignificance=record.ecologicalSignificanceVersion[lenEcol-1].ecologicalSignificance;
    }

    if(typeof record.invasivenessVersion[lenInva-1]!=="undefined"){
      lastRec.invasiveness=record.invasivenessVersion[lenInva-1].invasiveness;
    }

    
      res.json(lastRec);
    }else{
      res.json({message: "The Record (Ficha) with id: "+id_rc+" doesn't exist."});
    }
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
  search
};
