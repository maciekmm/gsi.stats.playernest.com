import * as middlewares from "./middlewares";
import NodeCache from "node-cache";
import {
	Player
}
from "../models/player";

const util = require("util");
const co = require("co");

export class Pipe {

	constructor(db) {
		this._userCache = new NodeCache({
			stdTTL: 3 * 60,
			checkPeriod: 200,
			useClones: false
		});
		this._userCache.on("del", (k, v) => {
			co(v.save(this._db));
		});
		this._db = db;
		this._preAuth = [middlewares.checkComponents, middlewares.checkCompetitive];
		this._middlewares = [middlewares.followMatch, middlewares.followRound, middlewares.archive];
	}

	* process(rawData) {
		let data = JSON.parse(rawData);

		for (let mw of this._preAuth) {
			let error = mw(data);
			if (error) {
				throw error;
			}
		}

		//Load user
		let player = this._userCache.get(data.provider.steamid);
		if (!player) {
			player = Player.fromDocument(yield this._db.find({
				_id: data.provider.steamid
			}).next());
			if (player) {
				this._userCache.set(data.provider.steamid, player);
			}
		}

		console.log(util.inspect(player, false, null));


		if (!player || player.auth != data.auth.token) {
			callback(new Error("Not authenticated"));
			return;
		}

		//Check if can be a continuation of previous match
		if (player.match) {
			if (!player.match.isContinuation(data)) {
				if (!player.match.isTrash()) {
					yield player.save();
				}
				player.match = null;
			}
		}

		//Other middlewares
		for (let mw of this._middlewares) {
			let error = mw(player, data);
			if (error) {
				throw error;
			}
		}
		yield player.save(this._db);
		if (player.match.isOver()) {
			player.matches.push(player.match);
			player.match = null;
			yield v.save(this._db);
		}
	}
}
