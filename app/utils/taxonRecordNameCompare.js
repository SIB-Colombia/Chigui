var compare = require('./scientificNameCompare.js');
exports.isEqual = function(prev,next){
	var res = true;

	if(!Compare.isEqual(prev.scientificName,next.scientificName)){return false};

	return res;
}