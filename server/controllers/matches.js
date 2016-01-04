const url = require('url');

const MAX_LIMIT = 5;

export default class MatchesController {

	constructor(collection) {
		this.collection = collection;
	}

	* push(match) {
		yield this.collection.insert(match);
	}

	* handler(req, res) {
		const queryString = url.parse(req.url, true).query;

		let limit = queryString.limit && queryString.limit <= MAX_LIMIT ? queryString.limit : MAX_LIMIT;

		let query = {
			owner: req.params.steamid,
			start: {
				$lt: queryString.time
			}
		};

		let match = yield this.collection.find(query).sort({
			start: -1
		}).limit(limit);

		res.json(JSON.stringify(match));
	}
}
