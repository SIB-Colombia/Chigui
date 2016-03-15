var measurementOrFactCompare = require('./measurementOrFactCompare.js');
exports.isEqual = function(prev,next){
	var res = true;
	/*
	console.log(prev.length);
	console.log(next.length);
	*/
	console.log(prev.directThreatsAtomized.length);
	console.log(next.directThreatsAtomized.length);
	if(prev.directThreatsAtomized.length==next.directThreatsAtomized.length){
		for(var i=0;i<prev.directThreatsAtomized.length;i++){	
			console.log(prev.directThreatsAtomized[i].measurementOrFact);
			console.log(next.directThreatsAtomized[i].measurementOrFact);
			console.log(!measurementOrFactCompare.isEqual(prev.directThreatsAtomized[i].measurementOrFact,next.directThreatsAtomized[i].measurementOrFact));
			if(!measurementOrFactCompare.isEqual(prev.directThreatsAtomized[i].measurementOrFact,next.directThreatsAtomized[i].measurementOrFact)){res=false; break};
			/*
			if(prev[i].firstName!=next[i].firstName){res=false; break};
			if(prev[i].lastName!=next[i].lastName){res=false; break};
			if(prev[i].position!=next[i].position){res=false};
			if(prev[i].organisation!=next[i].organisation){res=false};
			if(prev[i].address!=next[i].address){res=false};
			if(prev[i].city!=next[i].city){res=false};
			if(prev[i].state!=next[i].state){res=false};
			if(prev[i].country!=next[i].country){res=false};
			if(prev[i].postalCode!=next[i].postalCode){res=false};
			if(prev[i].phone!=next[i].phone){res=false};
			if(prev[i].email!=next[i].email){res=false};
			if(prev[i].homepage!=next[i].homepage){res=false};
			if(prev[i].personnelDirectory!=next[i].personnelDirectory){res=false};
			if(prev[i].personnelIdentifier!=next[i].personnelIdentifier){res=false};
			if(prev[i].role!=next[i].role){res=false};
			*/
		}
	}else{
		res=false;
	}
	return res
}