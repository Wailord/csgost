var mongoose = require('mongoose');

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	id: Number,
	url: String,
	name: String,
});

var playerSchema = mongoose.Schema({
	id: Number,
	name: String,
	url: String,
	kills: Number,
	headshots: Number,
	assists: Number,
	deaths: Number,
});

var halvesSchema = mongoose.Schema({
	score: Number,
	side: String,
});

var teamSchema = mongoose.Schema({
	id: String,
	name: String,
	halves: [halvesSchema],
	url: String,
	score: Number,
	players: [playerSchema],
});

var matchSchema = mongoose.Schema({
	id: String,
	map: String,
	url: String,
	date: Number,
	format: Number,
	team1: [teamSchema],
	team2: [teamSchema],
	event: [eventSchema],
});

module.exports = mongoose.model('Match', matchSchema);