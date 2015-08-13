angular.module('MainController', []).controller('MainController', function($scope)
{
    $scope.tagline = 'Choose your parameters and get the requested history from HLTV\'s match listing.';
    $scope.teams = [
    	{id: 0, name: 'any team'},
	    {id: 1, name: 'Cloud9'},
	    {id: 2, name: 'Virtus.pro'}
	];
    $scope.maps = [
    	{id: 0, name: 'any map'},
	    {id: 1, name: 'overpass'},
	    {id: 2, name: 'cobblestone'}
	];
});
