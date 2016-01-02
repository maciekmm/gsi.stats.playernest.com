import Match from "./match";

export default class Player {
	static fromDocument(doc) {
		let player = new Player(doc._id, doc.auth);
		if (doc.match) {
			player.match = Match.fromDocument(doc.match);
		}
		player.matches = doc.matches;
		return player;
	}

	constructor(steamid, auth) {
		this._id = steamid;
		this.auth = auth;
		this.matches = [];
	}
}
