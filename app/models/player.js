var mongoose = require('mongoose');

var db = mongoose.connection;

var playerSchema = mongoose.Schema({
	id: Number,
	url: String,
	name: String,
	wins: Number,
	losses: Number,
	rating: Number,
	rd: Number,
	vol: Number,
	rating2: Number,
	rd2: Number 
});

module.exports = mongoose.model('Player', playerSchema);