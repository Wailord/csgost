var request = require('request');
	cheerio = require('cheerio');
	sleep = require('sleep');
	Match = require('../app/models/match');
	async = require('async');
	lupus = require('lupus');

var hltvparser = module.exports = {};

hltvparser.runScraper = function()
{
	scrapeHLTVPage(0);
	scrapeHLTVPage(1);
};

var scrapeHLTVPage = function(pageNum) {
	var url = 'http://www.hltv.org/?pageid=188&offset=' + (pageNum * 50);

	var parsedMatches = [];
	request(url, function(err, response, html) {
		if(!err) {
			console.log('scraping page #' + pageNum);
			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			lupus(0, (matches.length - 6) / 5, function(x) {
				var dateLink = $(matches[x * 5 + 6]);
				var matchURL = 'http://www.hltv.org' + dateLink.parent().attr('href');
				var unparseddate = dateLink.text();
				var matchID = matchURL.substring(matchURL.lastIndexOf('=') + 1);

				var day = unparseddate.substring(0, unparseddate.indexOf('/'));
				var month = unparseddate.substring(unparseddate.indexOf('/') + 1, unparseddate.indexOf(' '));
				var year = unparseddate.substring(unparseddate.indexOf(' ') + 1);
				year = '20' + year;

				var date = new Date(month + "/" + day + "/" + year).getTime();

				Match.count({id: matchID}, function(err, count) {
					if(count > 0)
					{
						//console.log('found duplicate');
					}
					else
					{
						(function(matchID, date) {
							scrapeHLTVMatch(matchID, date);
						})(matchID, date);
					}
				});
			});
		}
		else
		{
			console.log("Error accessing match list page: " + pageNum + ". Requeuing.");
			sleep.sleep(4);
			scrapeHLTVPage(pageNum);
		}
	})

	return parsedMatches;
}

var scrapeHLTVMatch = function(hltvMatchID, date) {
	var hltvMatchURL = 'http://www.hltv.org/?pageid=188&matchid=' + hltvMatchID;

	request(hltvMatchURL, function(err, response, html) {
		if(!err) {
			var match = {};
			var matchEvent = {};
			var team1 = {};
			var team1players = [];
			var team1halves = [];
			var team2 = {};
			var team2players = [];
			var team2halves = [];

			var $ = cheerio.load(html);
			var matches = $('div .covSmallHeadline');
			var x;

			var team1id = "";
			var team1name = "";
			var team1URL = "";
			var team2score = "";

			var team2id = "";
			var team2name = "";
			var team2URL = "";
			var team2score = "";

			var eventname = "";
			var eventurl = "";
			var eventid = "";
			
			// get all match info

			// 1 = team1 vs team2
			var split = $(matches[1]).text().indexOf(' vs  ');
			team1name = $(matches[1]).text().substring(1, split);
			team1.name = team1name;

			team1URL = $(matches[1]).children().attr('href');
			if(team1URL != "")
			{
				team1id = team1URL.substring(team1URL.lastIndexOf('=') + 1);
				team1.url = 'http://www.hltv.org' + team1URL;
				team1.id = team1id;
			}
			else
			{
				team1.url = "";
				team1.id = "";
			}

			team2name = $(matches[1]).text().substring(split + 5);
			team2.name = team2name;

			team2URL = $(matches[1]).children().next().attr('href');
			if(team2URL != "")
			{
				team2id = team2URL.substring(team2URL.lastIndexOf('=') + 1);
				team2.id = team2id;
				team2.url = 'http://www.hltv.org' + team2URL;
			}
			else
			{
				team2.id = "";
				team2.url = "";
			}

			// 3 = map name
			var map = $(matches[3]).text();

			// 5 = event name
			eventname = $(matches[5]).children().attr('title');
			eventurl = $(matches[5]).children().children().attr('href');
			eventid = eventurl.substring(eventurl.lastIndexOf('=') + 1);
			matchEvent.id = eventid;
			matchEvent.name = eventname;
			matchEvent.url = 'http://www.hltv.org' + eventurl;

			// 7 = score
			var scoreline = $(matches[9]).find('span');

			var t1startedCT = ($(scoreline[2]).attr('style') == 'color:blue;');
			var team1score = $(scoreline[0]).text();
			var team2score = $(scoreline[1]).text();

			var t1half1 = {};
			var t1h1s = $(scoreline[2]).text()
			t1half1.score = t1h1s;
			if(t1startedCT)
				t1half1.side = "ct";
			else
				t1half2.side = "t";

			var t2half1 = {};
			var t2h1s = $(scoreline[3]).text()
			t2half1.score = t2h1s;
			if(t1startedCT)
				t2half1.side = "t";
			else
				t2half1.side = "ct";

			var t1half2 = {};
			var t1h2s = $(scoreline[4]).text()
			t1half2.score = t1h2s;
			if(t1startedCT)
				t1half2.side = "t";
			else
				t1half2.side = "ct";

			var t2half2 = {};
			var t2h2s = $(scoreline[5]).text()
			t2half2.score = t2h2s;
			if(t1startedCT)
				t2half2.side = "ct";
			else
				t2half2.side = "t";

			team1halves.push(t1half1);
			team1halves.push(t1half2);

			team2halves.push(t2half1);
			team2halves.push(t2half2);

			if(scoreline.length > 6)
			{
				var team1ot = $(scoreline[6]).text()
				var t1ot = {};
				t1ot.score = team1ot;
				t1ot.side = "ot";
				team1halves.push(t1ot);

				var team2ot = $(scoreline[7]).text()
				var t2ot = {};
				t2ot.score = team2ot;
				t2ot.side = "ot";
				team2halves.push(t2ot);
			}

			// assign the general data we got above to our match object
			team1.halves = team1halves;
			team1.score = team1score;
			team2.halves = team2halves;
			team2.score = team2score;
			match.event = matchEvent;
			match.map = map;
			match.team1 = team1;
			match.team2 = team2;
			match.date = date;

			// get all player info
			lupus(0, (matches.length - 34) / 8, function(x) {
				var player = {};
				var playerelement = $(matches[x * 8 + 34]);
				var teamelement = $(matches[x* 8+1 + 34]);
				var killelement = $(matches[x* 8+2 + 34]);
				var assistelement = $(matches[x* 8+3 + 34]);
				var deathelement = $(matches[x* 8+4 + 34]);

				var playerName = playerelement.text().substring(1);
				var playerURL = 'http://www.hltv.org' + playerelement.children().next().attr('href');
				var playerTeam = teamelement.text();

				var playerKillHS = killelement.text();
				var lastParen = playerKillHS.lastIndexOf('(');
				var playerHeadshots = playerKillHS.substring(lastParen + 1);
				playerHeadshots = playerHeadshots.substring(0, playerHeadshots.length - 1);
				if(playerHeadshots == "-")
					playerHeadshots = 0;

				var playerKills = playerKillHS.substring(0, lastParen - 1);
				if(playerKills == "-")
					playerKills = 0;

				var playerAssists = assistelement.text();
				if(playerAssists == "-")
					playerAssists = 0;

				var playerDeaths = deathelement.text();
				if(playerDeaths == "-")
					playerDeaths = 0;

				var playerID = playerURL.substring(playerURL.indexOf('&') + 10);

				player.id = playerID;
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
					console.log("error: player " + player.name + " on " + hltvMatchURL + " not playing for " + team1name + " or " + team2name);	
			}, function() {
				match.id = hltvMatchID;
				match.map = map;
				match.url = hltvMatchURL;
				match.team1.players = team1players;
				match.team2.players = team2players;

				sleep.sleep(2);
				Match.collection.insert(match);
				console.log('inserted match id ' + match.id);
			});
		}
		else
		{
			console.log("Error accessing match page: " + hltvMatchURL + ". Requeuing.");
			scrapeHLTVMatch(hltvMatchID, date);
		}
	})
}