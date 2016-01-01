import {
	Pipe
}
from "./gsi/pipe";

import {
	Player
}
from "./models/player";

import {
	PlayersController
}
from "./controllers/players";

const cfg = require("./config/config." + (process.env.NODE_ENV || 'dev') + ".json");
const MongoClient = require('mongodb').MongoClient;
const wrap = require("co-express");
const co = require("co");
const bodyParser = require("body-parser");
const passport = require("passport");
const crypto = require('crypto');
const SteamStrategy = require("passport-steam").Strategy;

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

MongoClient.connect(cfg.mongo.uri, (err, db) => {
	start(db);
});

function start(db) {
	const app = require("express")();
	const coord = new PlayersController(db.collection("players"));
	const pipe = new Pipe(coord);

	app.use(passport.initialize());
	app.use(passport.session());
	app.use(bodyParser.json());

	passport.use(new SteamStrategy({
			returnURL: 'http://i.stats.playernest.com/auth/return',
			realm: 'http://i.stats.playernest.com/',
			apiKey: ''
		},
		co.wrap(function*(identifier, profile, done) {
			const id = identifier.replace('http://steamcommunity.com/openid/id/', '');

			let user = yield coord.find(id);

			if (!user) {
				user = new Player(id, crypto.randomBytes(64).toString('hex'));
			}
			//TODO: Escape
			user.name = profile.displayName;
			user.avatar = profile.avatar;

			done(null, user);
		})
	));

	app.get('/auth', passport.authenticate('steam'), function(req, res) {});

	app.get('/auth/return',
		passport.authenticate('steam', {
			failureRedirect: '/auth'
		}),
		function(req, res) {
			res.redirect('/dashboard');
		});

	app.post('/gsi', wrap(pipe.process));
	app.post('/profile', ensureAuthenticated, (req,res) => {
		res.
		res.send();
	});

	app.listen(cfg.server.port, function() {
		console.log("Started");
	});
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth');
}
