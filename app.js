import {
	Pipe
}
from "./gsi/pipe";

import {PlayersController} from "./controllers/players";

const cfg = require("./config/config." + (process.env.NODE_ENV || 'dev') + ".json");
const MongoClient = require('mongodb').MongoClient;
const wrap = require("co-express");
const bodyParser = require("body-parser");

MongoClient.connect(cfg.mongo.uri, (err, db) => {
	db.authenticate("admin", "admin", (err, result) => {
		start(db);
	});
});

function start(db) {
	const app = require("express")();
	const coord = new PlayersController(db.collection("players"));
	const pipe = new Pipe(coord);

	app.use(bodyParser.json());

	app.post('/gsi', wrap(pipe.process));

	app.listen(cfg.server.port, function() {
		console.log("Started");
	});
}
