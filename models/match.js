import {Round} from "./round";

export class Match {
	static fromDocument(doc) {
		let match = new Match(doc.map, doc.mode, doc.start, doc.version);
		match.phases = doc.phases;
		for(let i=0;i<doc.rounds.length;i++) {
			if(doc.rounds[i]) {
				match.rounds[i] = Round.fromDocument(doc.rounds[1]);
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
		if (this.map != data.map.name) {
			return false;
		}

		if (this.rounds.length > data.map.round + 1) {
			return false;
		}

		//TODO: Check if score counts
		return true;
	}

	// Whether match data is trash
	// TODO: It's very temporary
	isTrash() {
		if (this.rounds.length < 5) {
			return true;
		}
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
