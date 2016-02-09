angular.module('TeamService', [])
	.factory('TeamService', ['$http', function($http) {
    var urlBase = '/api/teams';
    var matchFactory = {};

    matchFactory.getTeams = function(name)
    {
    	var data = {};
    	
    	return $http.post(urlBase, data);
    }

    return matchFactory;
}]);
