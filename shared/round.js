export default class Round {
	static fromDocument(doc) {
		let round = new Round();
		Object.assign(round, doc);
		return round;
	}

	constructor() {
		this.general = {};
		this.player = {};
	}

	//a lot of statistic method;
}
