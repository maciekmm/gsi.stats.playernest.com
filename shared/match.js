import Round from "./round";

export default class Match {
	static fromDocument(doc) {
		let match = new Match();
		Object.assign(match, doc);
		for (let i = 0; i < match.rounds.length; i++) {
			if (match.rounds[i]) {
				match.rounds[i] = Round.fromDocument(match.rounds[i]);
			}
		}
		return match;
	}

	constructor(owner, map, mode, start, version) {
		this.owner = owner;
		this.map = map;
		this.mode = mode;
		this.start = start;
		this.version = version;
		this.rounds = [];
		this.phases = [];
	}

	// Whether data can be a continuation of match
	isContinuation(data) {
		if (data.map.name != this.map) {
			return false;
		}
		if (this.rounds.length - 1 > data.map.round) {
			return false;
		}
		return true;
	}

	// Whether match data is trash
	// TODO: It's very temporary
	isTrash() {
		let score = 0;
		let rounds = 0;
		for (let round in this.rounds) {
			if (round) {
				rounds++;
			}
		}
		if (rounds + 1 < this.rounds.length) {
			score += 5;
		}
		if (rounds < 5) {
			score += 5;
		}
		return score > 5;
	}

	isOver() {
		for (let phase of this.phases) {
			if (phase.value == "gameover") {
				return true;
			}
		}
		return false;
	}
}
