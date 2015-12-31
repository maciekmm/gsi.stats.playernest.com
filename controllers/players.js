import {Player} from "../models/player";

const NodeCache = require("node-cache");
const co = require("co");

export class PlayersController {
	constructor(collection) {
		this.collection = collection;

		this._userCache = new NodeCache({
			stdTTL: 3 * 60,
			checkPeriod: 200,
			useClones: false
		});

		this._userCache.on("del", (k, v) => {
			co(save(v));
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
