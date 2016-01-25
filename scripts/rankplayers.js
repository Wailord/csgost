var trueskill = require('trueskill')
var Player = require('../app/models/player');
var Match = require('../app/models/match')
var async = require('async');

var rankplayers = module.exports = {};

rankplayers.runPlayerRanker = function() {
	console.log('getting all matches');
   	Match.find().sort({date: 1}).exec(function (err, docs) {
   		if(err)
   			console.log('Error finding matches: ' + err);
   		else {
			async.eachSeries(docs, function(match, callback)
			{
	   			updateMatch(match, callback);
	    	},
	    	function(err) {
	    		console.log('done running through all matches');
	    	});
		}
   	});
}

var updateMatch = function(match, callback) {
	console.log('updating match from ' + match.date + ' (' + match.id + ')');
	var team1 = match.team1;
	var team2 = match.team2;

	var team1players = team1[0].players;
	var team2players = team2[0].players;

	var team1won = team1[0].score > team2[0].score;
	var teamsTied = team1[0].score == team2[0].score;
	var players = [];

	// some matches don't correctly parse players (unfortunately); until it's fixed, just skip those matches
	// when ranking players
	if(teamsTied || team1players.length != 5 || team2players.length != 5) callback();
	else
	{
		console.log('players on team: ' + team1players.length);
		async.forEach(team1players, function(player, c) {
			getPlayer(player, players, team1won, callback);
		});

		console.log('players on team: ' + team2players.length);
		async.forEach(team2players, function(player, c) {
			getPlayer(player, players, team1won, callback);
		});
	}
}

var getPlayer = function(player, players, teamWon, callback)
{
	console.log('getting a player');
	Player.findOne({id : player.id}, function (err, p) {
		if(err)
			console.log('Mongo error: ' + err);
		else
		{
			// new player, we need to create a new skillrating and add to database
			var newPlayer = {};
			newPlayer.name = player.name;
			newPlayer.id = player.id;
			newPlayer.url = player.url;
			
			if(!p)
			{
				newPlayer.skill = [25.0, 25.0 / 3.0];
				newPlayer.wins = 0;
				newPlayer.losses = 0;
				//console.log("couldn't find " + player.id + " in database");
			}
			else {
				newPlayer.skill = p.skill;
				newPlayer.wins = p.wins;
				newPlayer.losses = p.losses;
				console.log('found existing skill for ' + player.id + ' (' + player.name + '), rating: ' + newPlayer.skill);
			}
			
			if(isNaN(parseInt(newPlayer.id)))
			{
				if(teamWon)
				{
					newPlayer.rank = 1;
				}
				else
				{
					newPlayer.rank = 2;
				}

				players.push(newPlayer);
				if(players.length == 10)
					savePlayers(players, callback);
			}
			else
			{
				Player.update({id: newPlayer.id}, newPlayer, {upsert:true}, function(err, inserted)
				{
					if(err)
						console.log('Error inserting player ' + newPlayer.id + ' into database: ' + err);
					else
					{
						console.log('inserted ' + newPlayer.id + ' into database');
						if(teamWon)
						{
							newPlayer.rank = 1;
							newPlayer.wins++;
						}
						else
						{
							newPlayer.rank = 2;
							newPlayer.losses++;
						}

						players.push(newPlayer);
						if(players.length == 10)
							savePlayers(players, callback);
					}
				});
			}
		}
	});
}

var savePlayers = function(players, callback)
{
	//console.log('saving players');
	async.series([
		function(next)
		{
			console.log('before');
			console.log(players[0]);
			trueskill.AdjustPlayers(players);
			next(null);
		},
		function(next)
		{
			console.log('after');
			console.log(players[0]);
			async.forEach(players, function(player, next2) {
				delete player.rank
				if(isNaN(parseInt(player.id)))
					next2();
				else
				{
					Player.update({id: player.id}, player, {upsert:true}, function(err, inserted)
					{
						if(err) {
							console.log('error updating player ranking: ' + err);
						}
						else {
 							console.log('updated ranking for player ' + player.name + ' (wins: ' + player.wins + ', losses: ' + player.losses + ')');
						}
						next2();
					});
				}
			}, function(err) {
				next(null);
			});
		},
		function(next)
		{
			console.log('saved players');
			callback();
		}
	]);
}