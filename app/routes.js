var Match = require('./models/match');
var path = require('path');

module.exports = function(app)
{
	app.get('/api/matches', function(req, res) 
	{
		var days = req.query.days;
		var mapsParam = req.query.maps;
		var teamsOr = req.query.teams_or;
		var teamsAnd = req.query.teams_and;

		var acceptedParams = 0;

		var query = Match.find();

		if(days)
		{
			var seconds = days * 3600 * 24;
			var today = Math.floor(Date.now() / 1000);
			days = today - seconds;
			query = query.where('date').gt(days);
			acceptedParams++;
		}

		if(mapsParam)
		{ 
			var maps = mapsParam.split(",");
			query = query.where('map').in(maps);
			acceptedParams++;
		}

		if(teamsOr)
		{
			var teams = teamsOr.split(",");
			query = query.or([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
			acceptedParams++;
		}

		if(teamsAnd)
		{
			var teams = teamsAnd.split(",");
			query = query.and([{"team1.name": {$in: teams}}, {"team2.name": {$in: teams}}]);
			acceptedParams++;
		}

		var suppliedParams = Object.keys(req.query).length;

		if(suppliedParams == acceptedParams && suppliedParams != 0)
		{
			query.exec(function (err, matches)
			{
				if(err)
					res.send(err);
				else
				{
					res.setHeader('Content-Type','application/json');
					res.send(matches);
				}
			});
		}
		else
		{
			res.status(400).send('Error 400: Malformed query; valid query parameters are days, teams_or, and teams_and, and maps.')
		}
	});

	// frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res)
    {
    	res.sendFile(path.join(__dirname, '../public/views', 'index.html'));
    });
}