var Match = require('./models/match');
	MatchSummary = require('./models/match_summary');
	Player = require('./models/player');
var path = require('path');

module.exports = function(app)
{
	app.post('/api/matches', function(req, res) 
	{
		var id = req.body.id;

		console.log('received a full query (POST match id ' + id + ')');

		var query = Match.find();
		query = query.find({'id': id})

		query.exec(function (err, match)
		{
			if(err)
				res.status(400).send(err);
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(match);
			}
		});
	});

	app.get('/api/players/:id', function(req, res) {
		var id = req.params.id;
		console.log('received a player query (GET player id ' + id + ')');

		var query = Player.find();
		query = query.find({'id': id})

		query.exec(function (err, player)
		{
			if(err)
				res.status(400).send(err);
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(player);
			}
		});
	});

	app.get('/api/odds', function(req, res) {
		var t1 = req.query.t1.split(',');
		var t2 = req.query.t2.split(',');

		console.log('GET odds request:');
		console.log(t1 + ' vs. ' + t2);

		var bothTeams = t1.concat(t2);

		var query = Player.find({id: {$in : bothTeams}});
		query.exec(function (err, players)
		{
			if(err) {
				console.log('error getting match odds: ' + err);
				res.status(400).send(err);
			}
			else if(players.length != 10)
			{
				res.send('Could not find exactly ten players. (found ' + players.length + ')');
			}
			else
			{
				var t1AvgRating = 0;
				var t2AvgRating = 0;

				players.forEach(function(player)
				{
					if(t1.indexOf(String(player.id)) > -1)
						t1AvgRating += player.rating;
					if(t2.indexOf(String(player.id)) > -1)
						t2AvgRating += player.rating;
				});

				t1AvgRating /= 5;
				t2AvgRating /= 5;

				var odds = 1 / (1 + Math.pow(10, (t2AvgRating - t1AvgRating) / 400 )); 

				var w = odds;
				var l = (1 - w);

				var bo3odds = (w * w) + (w * l * w) + (l * w * w);
				var bo5odds = 	(l * l * w * w * w) + 	// w^3 + l^2
								(l * w * l * w * w) + 	// w^3 + l^2
								(l * w * w * l * w) + 	// w^3 + l^2
								(w * l * l * w * w) + 	// w^3 + l^2
								(w * l * w * l * w) + 	// w^3 + l^2
								(w * w * l * l * w) + 	// w^3 + l^2
								(w * w * l * w) +		// w^3 + l^1
								(w * l * w * w) +		// w^3 + l^1
								(l * w * w * w) + 		// w^3 + l^1
								(w * w * w);			// w^3

				res.setHeader('Content-Type','application/json');

				response.bo1 = odds;
				response.bo3 = bo3odds;
				response.bo5 = bo5odds;
				response.t1rating = t1AvgRating;
				response.t2rating = t2AvgRating;

				res.send(response);
			}
		});
	});

	app.post('/api/odds', function(req, res) {
		var t1 = req.body.t1;
		var t2 = req.body.t2;

		console.log('POST odds request:');
		console.log(t1 + ' vs. ' + t2);

		var bothTeams = t1.concat(t2);

		var query = Player.find({id: {$in : bothTeams}});
		query.exec(function (err, players)
		{
			if(err) {
				console.log('error getting match odds: ' + err);
				res.status(400).send(err);
			}
			else if(players.length != 10)
			{
				res.send('Could not find exactly ten players. (found ' + players.length + ')');
			}
			else
			{
				var response = {};
				response.players = {};

				var t1AvgRating = 0;
				var t2AvgRating = 0;

				players.forEach(function(player)
				{
					response.players[player.id] = player;
					if(t1.indexOf(player.id) > -1)
						t1AvgRating += player.rating;
					if(t2.indexOf(player.id) > -1)
						t2AvgRating += player.rating;
				});

				t1AvgRating /= 5;
				t2AvgRating /= 5;

				var odds = 1 / (1 + Math.pow(10, (t2AvgRating - t1AvgRating) / 400 ));

				var w = odds;
				var l = (1 - odds);

				var bo3odds = (w * w) + (w * l * w) + (l * w * w);
				var bo5odds = 	(l * l * w * w * w) + 	// w^3 + l^2
								(l * w * l * w * w) + 	// w^3 + l^2
								(l * w * w * l * w) + 	// w^3 + l^2
								(w * l * l * w * w) + 	// w^3 + l^2
								(w * l * w * l * w) + 	// w^3 + l^2
								(w * w * l * l * w) + 	// w^3 + l^2
								(w * w * l * w) +		// w^3 + l^1
								(w * l * w * w) +		// w^3 + l^1
								(l * w * w * w) + 		// w^3 + l^1
								(w * w * w);			// w^3

				res.setHeader('Content-Type','application/json');

				response.bo1 = odds;
				response.bo3 = bo3odds;
				response.bo5 = bo5odds;
				response.t1rating = t1AvgRating;
				response.t2rating = t2AvgRating;

				res.send(response);
			}
		});
	});


	app.get('/api/matches/:id', function(req, res) 
	{
		var id = req.params.id;
		console.log('received a full query (GET match id ' + id + ')');

		var acceptedParams = 0;

		var query = Match.find();
		query = query.find({'id': id})

		query.exec(function (err, match)
		{
			if(err)
				res.status(400).send(err);
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(match);
			}
		});
	});

	app.post('/api/match_summaries', function(req, res) 
	{
		var days = req.body.days;
		var mapsParam = req.body.maps;
		var teamsOr = req.body.teams_or;
		var teamsAnd = req.body.teams_and;

		console.log('received a summary query, days = ' + days + ', maps = ' + mapsParam + ', teamsOr = ' + teamsOr);

		var acceptedParams = 0;

		var query = MatchSummary.find();

		if(days)
		{
			var minDate = new Date(days);
			query = query.where('date').gte(minDate);
		}

		if(mapsParam)
		{ 
			var maps = mapsParam
			query = query.where('map').in(maps);
		}

		if(teamsOr)
		{
			var teams = teamsOr;
			query = query.or([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
		}

		if(teamsAnd)
		{
			var teams = teamsAnd;
			query = query.and([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
		}

		query.sort({ date : 'asc'}).exec(function (err, matches)
		{
			if(err)
				res.status(400).send(err);
			else
			{
				res.setHeader('Content-Type','application/json');
				res.send(matches);
			}
		});
	});

	// frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res)
    {
    	res.sendFile(path.join(__dirname, '../public/views', 'index.html'));
    });
}