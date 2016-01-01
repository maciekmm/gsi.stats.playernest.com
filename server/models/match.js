import {
	Round
}
from "./round";

export class Match {
	static fromDocument(doc) {
		let match = new Match();
		Object.assign(match, doc);
		for (let i = 0; i < doc.rounds.length; i++) {
			if (doc.rounds[i]) {
				match.rounds[i] = Round.fromDocument(doc.rounds[i]);
			}
		}
		return match;
	}

	constructor(map, mode, start, version) {
		this.map = map;
		this.mode = mode;
		this.start = start;
		this.version = version;
		this.rounds = [];
		this.phases = [];
	}

	// Whether data can be a continuation of match
	isContinuation(data) {
		if(this.rounds.length-2 > data.map.round) {
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
		return score>5;
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
