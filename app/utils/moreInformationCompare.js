var mongoose = require('mongoose');

exports.isEqual = function(prev,next){
	var res = true;
	if(prev!=next){res=false}
	return res
}