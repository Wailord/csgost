var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId; 

var db = mongoose.connection;

var eventSchema = mongoose.Schema({
	url: String,
	name: String,
});

var scoreSchema = mongoose.Schema({
	team_1: Number,
	team_2: Number,
});

var teamSchema = mongoose.Schema({
	url: String,
	name: String,
});

var matchSchema = mongoose.Schema({
	_id: String,
	map: String,
	url: String,
	date: Number,
	team1: [teamSchema],
	team2: [teamSchema],
	score: [scoreSchema],
	event: [eventSchema]
});

module.exports = mongoose.model('Match', matchSchema);