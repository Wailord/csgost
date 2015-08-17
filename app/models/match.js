var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	url: String,
	name: String,
});

var playerSchema = mongoose.Schema({
	id: Number,
	url: String,
	handle: String,
	kills: Number,
	headshots: Number,
	assists: Number,
	deaths: Number,
});

var teamSchema = mongoose.Schema({
	id: String,
	score: Number,
	url: String,
	players: [playerSchema],
});

var matchSchema = mongoose.Schema({
	id: String,
	map: String,
	url: String,
	date: Number,
	team1: [teamSchema],
	team2: [teamSchema],
	event: [eventSchema],
});

module.exports = mongoose.model('Match', matchSchema);