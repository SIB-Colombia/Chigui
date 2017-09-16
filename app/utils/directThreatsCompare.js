var measurementOrFactCompare = require('./measurementOrFactCompare.js');
exports.isEqual = function(prev,next){
	var res = true;
	if(prev.directThreatsAtomized.length==next.directThreatsAtomized.length){
		for(var i=0;i<prev.directThreatsAtomized.length;i++){
			if(!measurementOrFactCompare.isEqual(prev.directThreatsAtomized[i].measurementOrFact,next.directThreatsAtomized[i].measurementOrFact)){return false};
			//if(!ancillaryCompare.isEqual(prev.directThreatsAtomized[i].ancillaryData,next.directThreatsAtomized[i].ancillaryData)){return false};
		}
	}else{
		return false;
	}
	if(prev.directThreatsUnstructured!=next.directThreatsUnstructured){return false};
	return res;
}