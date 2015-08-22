var mongoose = require('mongoose');

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	id: Number,
	url: String,
	name: String,
});

var teamSchema = mongoose.Schema({
	id: Number,
	name: String,
	url: String,
	score: Number,
});

var matchSummarySchema = mongoose.Schema({
	id: Number,
	map: String,
	url: String,
	//format: Number,
	date: Date,
	team1: [teamSchema],
	team2: [teamSchema],
	event: [eventSchema],
});

module.exports = mongoose.model('MatchSummary', matchSummarySchema);