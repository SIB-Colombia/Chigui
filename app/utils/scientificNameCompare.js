exports.isEqual = function(prev,next){
	var res = true;

	//Si la version previa del valor y la version siguiente son diferentes se retorna false y se termina la función, lo cual permite guardar el elemento
	if(prev.attributes.id!=next.attributes.id){return false};
	if(prev.attributes.isAnamorphic!=next.attributes.isAnamorphic){return false};
	if(prev.attributes.nomenclaturalCode!=next.attributes.nomenclaturalCode){return false};

	if(prev.simple!=next.simple){return false};
	if(prev.rank!=next.rank){return false};

	if(prev.canonicalName.simple!=next.canonicalName.simple){return false};
	if(prev.canonicalName.uninomial!=next.canonicalName.uninomial){return false};
	if(prev.canonicalName.genus.ref!=next.canonicalName.genus.ref){return false};
	if(prev.canonicalName.genus.linkType!=next.canonicalName.genus.linkType){return false};
	if(prev.canonicalName.epithet.infragenericEpithet!=next.canonicalName.epithet.infragenericEpithet){return false};
	if(prev.canonicalName.epithet.specificEpithet!=next.canonicalName.epithet.specificEpithet){return false};
	if(prev.canonicalName.epithet.infraspecificEpithet!=next.canonicalName.epithet.infraspecificEpithet){return false};

	if(prev.canonicalAuthorship.simple!=next.canonicalAuthorship.simple){return false};
	if(prev.canonicalAuthorship.authorship.simple!=next.canonicalAuthorship.authorship.simple){return false};
	if(prev.canonicalAuthorship.authorship.year.length==next.canonicalAuthorship.authorship.year.length){
		for(var i=0;i<prev.canonicalAuthorship.authorship.year.length;i++){
			if(prev.canonicalAuthorship.authorship.year[i]!=next.canonicalAuthorship.authorship.year[i]){return false}
		}
	}else{
		return false;
	}
	if(prev.canonicalAuthorship.authorship.authors.length==next.canonicalAuthorship.authorship.authors.length){
		for(var i=0;i<prev.canonicalAuthorship.authorship.authors.length;i++){
			if(prev.canonicalAuthorship.authorship.authors[i]!=next.canonicalAuthorship.authorship.authors[i]){return false}
		}
	}else{
		return false;
	}

	if(prev.specialAuthorship.basionymAuthorship.simple!=next.specialAuthorship.basionymAuthorship.simple){return false};
	if(prev.specialAuthorship.basionymAuthorship.year.length==next.specialAuthorship.basionymAuthorship.year.length){
		for(var i=0;i<prev.specialAuthorship.basionymAuthorship.year.length;i++){
			//console.log(prev.specialAuthorship.basionymAuthorship.year[i]+""!=next.specialAuthorship.basionymAuthorship.year[i]+"");
			if(prev.specialAuthorship.basionymAuthorship.year[i]+""!=next.specialAuthorship.basionymAuthorship.year[i]+""){return false}
		}
	}else{
		return false;
	}
	if(prev.specialAuthorship.basionymAuthorship.authors.length==next.specialAuthorship.basionymAuthorship.authors.length){
		for(var i=0;i<prev.specialAuthorship.basionymAuthorship.authors.length;i++){
			if(prev.specialAuthorship.basionymAuthorship.authors[i]!=next.specialAuthorship.basionymAuthorship.authors[i]){return false}
		}
	}else{ 
		return false;
	}

	//****
	
	if(typeof  prev.specialAuthorship.combinationAuthorship!=="undefined" && typeof  next.specialAuthorship.combinationAuthorship!=="undefined"){
		if(prev.specialAuthorship.combinationAuthorship.length==next.specialAuthorship.combinationAuthorship.length){
			for(var i=0;i<prev.specialAuthorship.combinationAuthorship.length;i++){
				if(prev.specialAuthorship.combinationAuthorship[i]!=next.specialAuthorship.combinationAuthorship[i]){return false}
			}
		}else{
			return false;
		}
	}else{
		return false;
	}

	if(prev.publishedln.identifier!=next.publishedln.identifier){return false};
	if(prev.publishedln.datatype!=next.publishedln.datatype){return false};
	if(prev.publishedln.source!=next.publishedln.source){return false};
	if(prev.publishedln.simple!=next.publishedln.simple){return false};

	if(prev.year!=next.year){return false};
	if(prev.microReference!=next.microReference){return false};
	if(prev.typificacion.simple!=next.typificacion.simple){return false};
	if(prev.typificacion.typeVoucherEntity.voucherReference.length==next.typificacion.typeVoucherEntity.voucherReference.length){
		for(var i=0;i<prev.typificacion.typeVoucherEntity.voucherReference.length;i++){
			if(prev.typificacion.typeVoucherEntity.voucherReference[i]!=next.typificacion.typeVoucherEntity.voucherReference[i]){return false}
		}
	}else{
		return false;
	}
	if(typeof  prev.typificacion.typeVoucherEntity.lectotypePublicationVoucher!=="undefined" && typeof  next.typificacion.typeVoucherEntity.lectotypePublicationVoucher!=="undefined"){
		if(prev.typificacion.typeVoucherEntity.lectotypePublicationVoucher.length==next.typificacion.typeVoucherEntity.lectotypePublicationVoucher.length){
			for(var i=0;i<prev.typificacion.typeVoucherEntity.lectotypePublicationVoucher.length;i++){
				if(prev.typificacion.typeVoucherEntity.lectotypePublicationVoucher[i]!=next.typificacion.typeVoucherEntity.lectotypePublicationVoucher[i]){return false}
			}
		}else{ 
			return false;
		}
	}else{
		return false;
	}

	if(prev.typificacion.typeVoucherEntity.lectotypeMicroReferenceVoucher.length==next.typificacion.typeVoucherEntity.lectotypeMicroReferenceVoucher.length){
		for(var i=0;i<prev.typificacion.typeVoucherEntity.lectotypeMicroReferenceVoucher.length;i++){
			if(prev.typificacion.typeVoucherEntity.lectotypeMicroReferenceVoucher[i]!=next.typificacion.typeVoucherEntity.lectotypeMicroReferenceVoucher[i]){return false}
		}
	}else{
		return false;
	}
	if(prev.typificacion.typeVoucherEntity.typeOfType!=next.typificacion.typeVoucherEntity.typeOfType){return false};

	if(prev.typeNameEntity.nameReference.identifier!=next.typeNameEntity.nameReference.identifier){return false};
	if(prev.typeNameEntity.nameReference.datatype!=next.typeNameEntity.nameReference.datatype){return false};
	if(prev.typeNameEntity.nameReference.source!=next.typeNameEntity.nameReference.source){return false};
	if(prev.typeNameEntity.lectotypePublication.identifier!=next.typeNameEntity.lectotypePublication.identifier){return false};
	if(prev.typeNameEntity.lectotypePublication.datatype!=next.typeNameEntity.lectotypePublication.datatype){return false};
	if(prev.typeNameEntity.lectotypePublication.source!=next.typeNameEntity.lectotypePublication.source){return false};
	if(prev.typeNameEntity.lectotypeMicroReference.identifier!=next.typeNameEntity.lectotypeMicroReference.identifier){return false};
	if(prev.typeNameEntity.lectotypeMicroReference.datatype!=next.typeNameEntity.lectotypeMicroReference.datatype){return false};
	if(prev.typeNameEntity.lectotypeMicroReference.source!=next.typeNameEntity.lectotypeMicroReference.source){return false};

	if(prev.spellingCorrentionOf.length==next.spellingCorrentionOf.length){
		for(var i=0;i<prev.spellingCorrentionOf.length;i++){
			if(prev.spellingCorrentionOf[i]!=next.spellingCorrentionOf[i]){return false}
		}
	}else{
		return false;
	}

	if(prev.basionym.ruleConsidered!=next.basionym.ruleConsidered){return false};
	if(prev.basionym.note!=next.basionym.note){return false};
	if(prev.basionym.reletedName.identifier!=next.basionym.reletedName.identifier){return false};
	if(prev.basionym.reletedName.datatype!=next.basionym.reletedName.datatype){return false};
	if(prev.basionym.reletedName.source!=next.basionym.reletedName.source){return false};
	if(prev.basionym.publishedln.identifier!=next.basionym.publishedln.identifier){return false};
	if(prev.basionym.publishedln.datatype!=next.basionym.publishedln.datatype){return false};
	if(prev.basionym.publishedln.source!=next.basionym.publishedln.source){return false};
	if(prev.basionym.microReference!=next.basionym.microReference){return false};

	if(prev.basedOn.ruleConsidered!=next.basedOn.ruleConsidered){return false};
	if(prev.basedOn.note!=next.basedOn.note){return false};
	if(prev.basedOn.reletedName.identifier!=next.basedOn.reletedName.identifier){return false};
	if(prev.basedOn.reletedName.datatype!=next.basedOn.reletedName.datatype){return false};
	if(prev.basedOn.reletedName.source!=next.basedOn.reletedName.source){return false};
	if(prev.basedOn.publishedln.identifier!=next.basedOn.publishedln.identifier){return false};
	if(prev.basedOn.publishedln.datatype!=next.basedOn.publishedln.datatype){return false};
	if(prev.basedOn.publishedln.source!=next.basedOn.publishedln.source){return false};
	if(prev.basedOn.microReference!=next.basedOn.microReference){return false};

	if(prev.conservedAgainst.length==next.conservedAgainst.length){
		for(var i=0;i<prev.conservedAgainst.length;i++){
			if(prev.conservedAgainst[i]!=next.conservedAgainst[i]){return false}
		}
	}else{
		return false;
	}

	if(prev.laterHomonymOf.ruleConsidered!=next.laterHomonymOf.ruleConsidered){return false};
	if(prev.laterHomonymOf.note!=next.laterHomonymOf.note){return false};
	if(prev.laterHomonymOf.reletedName.identifier!=next.laterHomonymOf.reletedName.identifier){return false};
	if(prev.laterHomonymOf.reletedName.datatype!=next.laterHomonymOf.reletedName.datatype){return false};
	if(prev.laterHomonymOf.reletedName.source!=next.laterHomonymOf.reletedName.source){return false};
	if(prev.laterHomonymOf.publishedln.identifier!=next.laterHomonymOf.publishedln.identifier){return false};
	if(prev.laterHomonymOf.publishedln.datatype!=next.laterHomonymOf.publishedln.datatype){return false};
	if(prev.laterHomonymOf.publishedln.source!=next.laterHomonymOf.publishedln.source){return false};
	if(prev.laterHomonymOf.microReference!=next.laterHomonymOf.microReference){return false};

	if(prev.sanctioned.ruleConsidered!=next.sanctioned.ruleConsidered){return false};
	if(prev.sanctioned.note!=next.sanctioned.note){return false};
	if(prev.sanctioned.reletedName.identifier!=next.sanctioned.reletedName.identifier){return false};
	if(prev.sanctioned.reletedName.datatype!=next.sanctioned.reletedName.datatype){return false};
	if(prev.sanctioned.reletedName.source!=next.sanctioned.reletedName.source){return false};
	if(prev.sanctioned.publishedln.identifier!=next.sanctioned.publishedln.identifier){return false};
	if(prev.sanctioned.publishedln.datatype!=next.sanctioned.publishedln.datatype){return false};
	if(prev.sanctioned.publishedln.source!=next.sanctioned.publishedln.source){return false};
	if(prev.sanctioned.microReference!=next.sanctioned.microReference){return false};

	if(prev.replacementNameFor.ruleConsidered!=next.replacementNameFor.ruleConsidered){return false};
	if(prev.replacementNameFor.note!=next.replacementNameFor.note){return false};
	if(prev.replacementNameFor.reletedName.identifier!=next.replacementNameFor.reletedName.identifier){return false};
	if(prev.replacementNameFor.reletedName.datatype!=next.replacementNameFor.reletedName.datatype){return false};
	if(prev.replacementNameFor.reletedName.source!=next.replacementNameFor.reletedName.source){return false};
	if(prev.replacementNameFor.publishedln.identifier!=next.replacementNameFor.publishedln.identifier){return false};
	if(prev.replacementNameFor.publishedln.datatype!=next.replacementNameFor.publishedln.datatype){return false};
	if(prev.replacementNameFor.publishedln.source!=next.replacementNameFor.publishedln.source){return false};
	if(prev.replacementNameFor.microReference!=next.replacementNameFor.microReference){return false};

	if(prev.publicationStatus.ruleConsidered!=next.publicationStatus.ruleConsidered){return false};
	if(prev.publicationStatus.note!=next.publicationStatus.note){return false};
	if(prev.publicationStatus.reletedName.identifier!=next.publicationStatus.reletedName.identifier){return false};
	if(prev.publicationStatus.reletedName.datatype!=next.publicationStatus.reletedName.datatype){return false};
	if(prev.publicationStatus.reletedName.source!=next.publicationStatus.reletedName.source){return false};
	if(prev.publicationStatus.publishedln.identifier!=next.publicationStatus.publishedln.identifier){return false};
	if(prev.publicationStatus.publishedln.datatype!=next.publicationStatus.publishedln.datatype){return false};
	if(prev.publicationStatus.publishedln.source!=next.publicationStatus.publishedln.source){return false};
	if(prev.publicationStatus.microReference!=next.publicationStatus.microReference){return false};

	if(prev.providerLink!=next.providerLink){return false};

	if(prev.providerSpecificData.anyOne.length==next.providerSpecificData.anyOne.length){
		for(var i=0;i<prev.providerSpecificData.anyOne.length;i++){
			if(prev.providerSpecificData.anyOne[i]!=next.providerSpecificData.anyOne[i]){return false}
		}
	}else{
		return false;
	}
	if(prev.providerSpecificData.anyTwo.length==next.providerSpecificData.anyTwo.length){
		for(var i=0;i<prev.providerSpecificData.anyTwo.length;i++){
			if(prev.providerSpecificData.anyTwo[i]!=next.providerSpecificData.anyTwo[i]){return false}
		}
	}else{
		return false;
	}

	return res
}