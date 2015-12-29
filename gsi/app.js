import {
	Pipe
}
from "./pipe/pipe";

var http = require("http");

var cfg = require("../config/config." + (process.env.NODE_ENV || 'dev') + ".json");

class GSI {
	constructor() {
		//this._db = new DB(cfg.mongo.uri, cfg.mongo.db);
		this.pipe = new Pipe(this._db);
	}

	createServer() {
		this._server = http.createServer((request, response) => {
			if (request.method == 'POST') {
				let body = '';

				request.on('data', (data) => {
					if (body.length > 3000000) {
						console.log("Request too long");
						response.writeHead(500);
						response.end();
						return;
					}
					body += data;
				});

				request.on('end', () => {

						//console.log(body);
						this.pipe.process(body, (error) => {
							if (error) {
								console.log(error);
								response.writeHead(200);
							} else {
								response.writeHead(200);
							}
							response.end();
						});

				});
			} else {
				response.writeHead(405);
				response.end();
			}
		});
		return this;
	}

	start() {
		this._server.listen(cfg.server.port, cfg.server.hostname);
	}
}

new GSI().createServer().start();
