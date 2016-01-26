var app = angular.module('OddsController', []);

app.controller('OddsController', ['$scope', 'OddsService', function($scope, OddsService)
	{
		$scope.message = "Work-in-progress!";

		$scope.res = 0;
		$scope.t1p0 = 429;
		$scope.t1p1 = 7170;
		$scope.t1p2 = 2469;
		$scope.t1p3 = 7347;
		$scope.t1p4 = 7398;
		$scope.t2p0 = 4954;
		$scope.t2p1 = 7592;
		$scope.t2p2 = 4959;
		$scope.t2p3 = 7168;
		$scope.t2p4 = 3055;

		$scope.getOdds = function()
		{
			var t1 = [$scope.t1p0, $scope.t1p1, $scope.t1p2, $scope.t1p3, $scope.t1p4];
			var t2 = [$scope.t2p0, $scope.t2p1, $scope.t2p2, $scope.t2p3, $scope.t2p4];

			OddsService.getOdds(t1, t2).then(function(response) {
				var odds = response.data.t1 * 100;
				odds = odds.toFixed(2);

				if(odds > 50) {
					$scope.message = 'Team 1 is favored and has a projected ' + odds + '% chance of winning.';
					$scope.res = 1;
				}
				else if(odds < 50) {
					$scope.message = 'Team 2 is favored and has a projected ' + (100 - odds) + '% chance of winning.';
					$scope.res = -1;
				}
				else {
					$scope.message = 'Too close to call!';
					$scope.res = 0;
				}
			});
		}
	}]
);
