var mongoose = require('mongoose');

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	id: Number,
	url: String,
	name: String,
});

var teamSchema = mongoose.Schema({
	id: String,
	name: String,
	url: String,
	score: Number,
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

module.exports = mongoose.model('MatchSummary', matchSchema);