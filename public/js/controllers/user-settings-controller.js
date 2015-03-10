angular.module("squall").controller('UserSettingsController', ['$scope', '$http', function($scope, $http) {

  $http.get("/api/users/current").success(function(user) {
    $scope.user = user;
  });

  $scope.save = function() {
    $http.post('/settings', $scope.user).success(function(data) {
      if (data.passed) {
        $('#success-alert').removeClass("hide");
      } else {
        $('#error-alert').html(data.errors);
        $('#error-alert').removeClass("hide");
      }
    });
  };

}]);