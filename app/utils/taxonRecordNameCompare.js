var compare = require('./scientificNameCompare.js');
exports.isEqual = function(prev,next){
	var res = true;
	//console.log(prev);
	//console.log(next);
	if(!compare.isEqual(prev.scientificName,next.scientificName)){return false};

	return res;
}