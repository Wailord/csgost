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

    $locationProvider.html5Mode(true);
}]);
