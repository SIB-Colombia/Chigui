exports.isEqual = function(prev,next){
	var res = true;
	/*
	console.log(prev);
	console.log(next);
	console.log(prev.measurementID!=next.measurementID);
	*/
	if(prev.measurementID!=next.measurementID){res=false};
	if(prev.measurementType!=next.measurementType){res=false};
	if(prev.measurementValue!=next.measurementValue){res=false};
	if(prev.measurementAccuracy!=next.measurementAccuracy){res=false};
	if(prev.measurementUnit!=next.measurementUnit){res=false};
	if(prev.measurementDeterminedDate!=next.measurementDeterminedDate){res=false};
	if(prev.measurementDeterminedBy!=next.measurementDeterminedBy){res=false};
	if(prev.measurementMethod!=next.measurementMethod){res=false};
	if(prev.measurementRemarks!=next.measurementRemarks){res=false};
	if(prev.relatedTo!=next.relatedTo){res=false};
	return res
}