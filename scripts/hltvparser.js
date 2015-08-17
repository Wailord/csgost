var request = require('request');
	cheerio = require('cheerio');

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
		if(pageNum > 5) moreData = false; 
	}
};

var getHLTVPage = function(pageNum) {
	console.log('getting HLTV page #' + pageNum);
	var url = 'http://www.hltv.org/?pageid=188&offset=' + (pageNum * 50);

	request(url, function(err, response, html) {
		if(!err)
		{
			var $ = cheerio.load(html);

			console.log('loaded a page, yay');
		}
	})
}

var parseHLTVPage = function(hltvPage) {

}

var parseHLTVMatch = function(hltvMatch) {

}

var parseHLTVPlayer = function(hltvPlayer) {

}

var updatePlayerInDatabase = function(player) {

}

var updateMatchInDatabase = function(player) {

}
