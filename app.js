import {
	Pipe
}
from "./pipe/pipe";

const http = require("http");

const cfg = require("./config/config." + (process.env.NODE_ENV || 'dev') + ".json");

class GSI {
	constructor() {
		//this._db = new DB(cfg.mongo.uri, cfg.mongo.db);
		this.pipe = new Pipe(this._db);
	}

	createServer() {
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
				try {
					this.pipe.process(body, (error) => {
						if (error) {
							//TODO: Some logger
							console.log(error);
						}
					});
				} catch (e) {
					console.log(e);
				} finally {
					//To avoid spam we return 200 ALWAYS;
					response.writeHead(200);
					response.end();
				}
			});
		});
		return this;
	}

	start() {
		this._server.listen(cfg.server.port, cfg.server.hostname);
	}
}

new GSI().createServer().start();
