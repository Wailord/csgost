var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	url: String,
	name: String,
});

var scoreSchema = mongoose.Schema({
	team1: Number,
	team2: Number,
});

var playerSchema = mongoose.Schema({
	id: Number,
	handle: String,
	kills: Number,
	headshots: Number,
	assists: Number,
	deaths: Number,
});

var teamSchema = mongoose.Schema({
	id: String,
	players: [playerSchema],
});

var matchSchema = mongoose.Schema({
	_id: String,
	map: String,
	url: String,
	date: Number,
	team1: [teamSchema],
	team2: [teamSchema],
	score: [scoreSchema],
	event: [eventSchema],
});

module.exports = mongoose.model('Match', matchSchema);