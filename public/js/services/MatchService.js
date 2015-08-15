angular.module('MatchService', [])
	.factory('MatchService', ['$http', function($http) {
    var urlBase = '/api/matches';
    var matchFactory = {};

    matchFactory.getMatches = function(days, team1, team2, map)
    {
    	var data = {};
    	data.days = days;
    	maps = [];
    	teams = [];
    	if(team1 != 'any team')
	    	teams.push(team1);
    	if(team2 != 'any team')
	    	teams.push(team2);
    	if(map != 'any map')
	    	maps.push(map);

	    if(teams.length == 1)
	    	data.teams_or = teams;
	    else if(teams.length == 2)
	    	data.teams_and = teams;

	    if(maps.length > 0)
	    	data.maps = maps;

    	return $http.post(urlBase, data);
    }

    return matchFactory;
}]);