exports.isEqual = function(prev,next){
	var res = true;

	if(prev.measurementID!=next.measurementID){return false};
	if(prev.measurementType!=next.measurementType){return false};
	if(prev.measurementValue!=next.measurementValue){return false};
	if(prev.measurementAccuracy!=next.measurementAccuracy){return false};
	if(prev.measurementUnit!=next.measurementUnit){return false};
	if(prev.measurementDeterminedDate!=next.measurementDeterminedDate){res=false};
	if(prev.measurementDeterminedBy.length==next.measurementDeterminedBy.length){
		for(var i=0;i<prev.measurementDeterminedBy.length;i++){
			if(prev.measurementDeterminedBy[i]!=next.measurementDeterminedBy[i]){return false}
		}
	}else{
		return false;
	}
	if(prev.measurementMethod!=next.measurementMethod){res=false};
	if(prev.measurementRemarks!=next.measurementRemarks){res=false};
	if(prev.relatedTo!=next.relatedTo){res=false};
	return res
}