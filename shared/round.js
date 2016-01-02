export default class Round {
	static fromDocument(doc) {
		let round = new Round();
		Object.assign(round, doc);
	}

	constructor() {
		this.general = {};
		this.player = {};
	}

	//a lot of statistic method;
}
