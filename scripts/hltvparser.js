var request = require('request');
	cheerio = require('cheerio');
	sleep = require('sleep');

var hltvparser = module.exports = {};

hltvparser.runScraper = function()
{
	// while you can get HLTV pages
	var pageNum = 0;
	var moreData = true;
	while(moreData)
	{
		var page = getHLTVPage(pageNum);
		//var matches = parseHLTVPage(page);
		//matches.forEach(function(match)) {
			//var match = parseHLTVMatch();
			//updateMatchInDatabase(match);
			//match.team1.players.forEach(function(player)) {
			//	updatePlayerInDatabase(player);
			//}
			//match.team2.players.forEach(function(player)) {
			//	updatePlayerInDatabase(player);
			//}
		//}

		pageNum++;
		if(pageNum > 0) moreData = false; 
	}
};

var getHLTVPage = function(pageNum) {
	var url = 'http://www.hltv.org/?pageid=188&offset=' + (pageNum * 50);

	var parsedMatches = [];

	request(url, function(err, response, html) {
		if(!err) {
			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			var x;
			for(x = 6; x < (matches.length); x += 5)
			{
				var match = {};
				var team1 = {};
				var team2 = {};
				var matchEvent = {};

				var dateLink = $(matches[x]);
				var date = dateLink.text();
				var matchURL = 'http://www.hltv.org' + dateLink.parent().attr('href');
				var matchID = matchURL.substring(matchURL.indexOf('&') + 9);

				var team1element = $(matches[x+1]);
				var team1namescore = team1element.text();
				var lastParen = team1namescore.lastIndexOf('(');
				var team1score = team1namescore.substring(lastParen + 1);
				team1score = team1score.substring(0, team1score.length - 1);

				var team1URL = 'http://www.hltv.org' + team1element.parent().attr('href');
				var team1ID = team1URL.substring(team1URL.indexOf('&') + 9);
				team1name = team1namescore.substring(1, lastParen - 1);

				team1.id = team1ID;
				team1.url = team1URL;
				team1.name = team1name;
				team1.score = team1score;

				var team2element = $(matches[x+2]);
				var team2namescore = team2element.text();
				var lastParen = team2namescore.lastIndexOf('(');
				var team2score = team2namescore.substring(lastParen + 1);
				team2score = team2score.substring(0, team2score.length - 1);

				var team2URL = 'http://www.hltv.org' + team2element.parent().attr('href');
				var team2ID = team2URL.substring(team2URL.indexOf('&') + 9);
				team2name = team2namescore.substring(1, lastParen - 1);

				team2.id = team2ID;
				team2.url = team2URL;
				team2.name = team2name;
				team2.score = team2score;

				var map = $(matches[x+3]).text();

				var eventLink = $(matches[x+4]);
				var eventTitle = eventLink.children().next().attr('title');
				var eventURL = 'http://www.hltv.org' + eventLink.parent().attr('href');

				matchEvent.url = eventURL;
				matchEvent.name = eventTitle;

				match.id = matchID;
				match.map = map;
				match.url = matchURL;
				match.date = date;
				match.team1 = team1;
				match.team2 = team2;
				match.event = matchEvent;

				var players = parseHLTVMatch(matchURL, team1.name, team2.name);
				//console.log(match);
				parsedMatches.push(match);
			}
		}
		else
		{
			console.log("Error accessing match list: " + url);
		}
	})
}

var parseHLTVMatch = function(hltvMatchURL, team1name, team2name) {

	var parsedPlayers = {};
	var team1players = [];
	var team2players = [];

	request(hltvMatchURL, function(err, response, html) {
		if(!err) {
			console.log('parsing ' + hltvMatchURL)
			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			var x;
			for(x = 34; x < (matches.length); x += 8)
			{
				var player = {};

				var playerelement = $(matches[x]);
				var teamelement = $(matches[x+1]);
				var killelement = $(matches[x+2]);
				var assistelement = $(matches[x+3]);
				var deathelement = $(matches[x+4]);

				var playerName = playerelement.text().substring(1);
				var playerURL = 'http://www.hltv.org' + playerelement.children().next().attr('href');
				var playerTeam = teamelement.text();

				var playerKillHS = killelement.text();
				var lastParen = playerKillHS.lastIndexOf('(');
				var playerHeadshots = playerKillHS.substring(lastParen + 1);
				playerHeadshots = playerHeadshots.substring(0, playerHeadshots.length - 1);
				var playerKills = playerKillHS.substring(0, lastParen - 1);

				var playerAssists = assistelement.text();
				if(playerAssists == "-")
					playerAssists = 0;
				var playerDeaths = deathelement.text();

				var playerID = playerURL.substring(playerURL.indexOf('&') + 10);

				player.ID = playerID;
				player.name = playerName;
				player.url = playerURL;
				player.kills = playerKills;
				player.headshots = playerHeadshots;
				player.assists = playerAssists;
				player.deaths = playerDeaths;
			
				if(playerTeam == team1name)
					team1players.push(player);
				else if(playerTeam == team2name)
					team2players.push(player);
				else
					console.log("error: player " + player.name + " on " + hltvMatchURL + " not playing for either of the provided teams");				
			}
			parsedPlayers.team1 = team1players;
			parsedPlayers.team2 = team2players;
			
			console.log(parsedPlayers);
			sleep.sleep(2);
		}
		else
		{
			console.log("Error accessing match page: " + hltvMatchURL);
		}
	})
}

var parseHLTVPlayer = function(hltvPlayer) {

}

var updatePlayerInDatabase = function(player) {

}

var updateMatchInDatabase = function(player) {

}
