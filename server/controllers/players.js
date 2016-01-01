import {Player} from "../models/player";

const NodeCache = require("node-cache");
const co = require("co");

export class PlayersController {
	constructor(collection) {
		this.collection = collection;

		this._userCache = new NodeCache({
			stdTTL: 180,
			checkPeriod: 200,
			useClones: false
		});

		this._userCache.on("del", (k, v) => {
			co(this.save(v));
		});
	}

	* find(steamid) {
		let player = this._userCache.get(steamid);
		if (!player) {
			player = Player.fromDocument(yield this.collection.find({
				_id: steamid
			}).next());
			if (player) {
				this._userCache.set(steamid, player);
			}
		}
		this._userCache.ttl(steamid, 180);
		return player;
	}

	* save(player) {
		let copy = {};
		Object.assign(copy, player);
		delete copy._oldData;
		yield this.collection.update({
			_id: copy._id
		}, copy);
	}
}
