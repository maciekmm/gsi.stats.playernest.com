import {
	Pipe
}
from "./pipe/pipe";

const http = require("http");
const cfg = require("./config/config." + (process.env.NODE_ENV || 'dev') + ".json");
const MongoClient = require('mongodb').MongoClient;
const co = require("co");


class GSI {

	start() {
		MongoClient.connect(cfg.mongo.uri, (err, db) => {
			console.log("was");
			db.authenticate("admin", "admin", (err, result) => {
				this._db = db;
				this.createServer().listen(cfg.server.port, cfg.server.host);
			});
		});
	}

	createServer() {
		this.pipe = new Pipe(this._db.collection("players"));
		this._server = http.createServer((request, response) => {
			if (request.method != 'POST') {
				response.writeHead(405);
				response.end();
				return;
			}

			let body = '';
			request.on('data', (data) => {
				if (body.length > 3000000) {
					console.log("Response too long");
					response.writeHead(403);
					response.end("Response too long");
					return;
				}
				body += data;
			});

			request.on('end', () => {
				co(this.pipe.process(body)).catch((e)=>{
					console.log(e.stack);
				});
				response.writeHead(200);
				response.end();
			});
		});
		return this._server;
	}
}

new GSI().start();
