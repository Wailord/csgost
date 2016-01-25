var mongoose = require('mongoose');

var db = mongoose.connection;

var playerSchema = mongoose.Schema({
	id: Number,
	url: String,
	name: String,
	wins: Number,
	losses: Number,
	skill: [Number]
});

module.exports = mongoose.model('Player', playerSchema);