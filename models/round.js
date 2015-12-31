export class Round {
	static fromDocument(doc) {
		return new Round(doc.general, doc.player);
	}

	constructor() {
		this.general = {};
		this.player = {};
	}

	//a lot of statistic method;
}
