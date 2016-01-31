angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'MainController'
        })

        .when('/odds', {
            templateUrl: 'views/odds.html',
            controller: 'OddsController'
        })

        .when('/teams', {
            templateUrl: 'views/teams.html',
            controller: 'TeamLeaderboardController'
        })

    $locationProvider.html5Mode(true);
}]);
