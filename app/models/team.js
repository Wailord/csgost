var mongoose = require('mongoose');

var db = mongoose.connection;

var teamSchema = mongoose.Schema({
	name: String,
	players: [Number],
});

module.exports = mongoose.model('Team', teamSchema);