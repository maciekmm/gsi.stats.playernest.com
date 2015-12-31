import {Match} from "./match";

export class Player {
	static fromDocument(doc) {
		let player = new Player(doc._id,doc.auth);
		player.match = Match.fromDocument(doc.match);
		player.matches = doc.matches;
		return player;
	}

	constructor(steamid, auth) {
		this._id = steamid;
		this.auth = auth;
		this.matches = [];
	}

	*save(collection) {
		let oldData = this._oldData;
		this._oldData = undefined;
		yield collection.update({
			_id: this._id
		}, this);
		this._oldData = oldData;
	}
}
