//import "babel-polyfill";
import Pipe from "./gsi/pipe";
import Player from "../shared/player";

import PlayersController from "./controllers/players";
import MatchesController from "./controllers/matches";

const cfg = require("./config/config." + (process.env.NODE_ENV || 'dev') + ".json");
const MongoClient = require('mongodb').MongoClient;
const wrap = require("co-express");
const co = require("co");
const bodyParser = require("body-parser");
const passport = require("passport");
const crypto = require('crypto');
const SteamStrategy = require("passport-steam").Strategy;
const escape = require('html-escape');

MongoClient.connect(cfg.mongo.uri, (err, db) => {
	start(db);
});


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		if (!req.params.steamid || req.params.steamid == req.user.steamid) {
			return next();
		}
	}
	res.status(403);
}

function start(db) {
	const app = require("express")();
	const players = new PlayersController(db.collection("players"));
	const matches = new MatchesController(db.collection("matches"));

	const pipe = new Pipe(players, matches);

	process.on('SIGINT', exit);
	process.on('SIGTERM', exit);

	function exit() {
		co(players.stop()).then((v) => {
			console.log("Saved profiles, exitting.");
			process.exit(1);
		}).catch((err) => {
			console.log(err);
			process.exit(1);
		});
	}

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());

	passport.use(new SteamStrategy({
			returnURL: 'http://i.stats.playernest.com/auth/return',
			realm: 'http://i.stats.playernest.com/',
			apiKey: 'E0214EAEA47D85A38B6B6BEF3AB5E317'
		},
		co.wrap(function*(identifier, profile, done) {
			const id = identifier.replace('http://steamcommunity.com/openid/id/', '');

			let user = yield players.find(id);

			if (!user) {
				user = new Player(id, crypto.randomBytes(64).toString('hex'));
			}
			//TODO: Escape
			//user.name = profile.displayName;
			//user.avatar = profile.avatar;

			done(null, user);
		})
	));

	app.get('/auth', passport.authenticate('steam'), function(req, res) {});

	app.get('/auth/return',
		passport.authenticate('steam', {
			failureRedirect: '/auth'
		}),
		function(req, res) {
			console.log("s");
			res.redirect('/profile/76561198044246594');
		});

	app.post('/gsi', wrap(pipe.process));

	app.get('/profile/:steamid', ensureAuthenticated, wrap(players.handler));

	app.get('/matches/:steamid', ensureAuthenticated, wrap(matches.handler));

	app.listen(cfg.server.port, function() {
		console.log("Started");
	});
}
