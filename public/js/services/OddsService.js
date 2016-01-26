angular.module('OddsService', [])
	.factory('OddsService', ['$http', function($http) {
    var urlBase = '/api/odds';
    var matchFactory = {};

    matchFactory.getOdds = function(team1, team2)
    {
    	var data = {};
        data.t1 = team1;
        data.t2 = team2;
    	
    	return $http.post(urlBase, data);
    }

    return matchFactory;
}]);
