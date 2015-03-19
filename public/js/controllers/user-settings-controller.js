angular.module("squall").controller('UserSettingsController', ['$scope', '$http', function($scope, $http) {
  $scope.aux = {
    showSuccess: false,
    changeUsername: false
  }
  $http.get("/api/users/current").success(function(user) {
    $scope.user = user;
  });

  $scope.save = function() {
    $scope.aux.showSuccess = false;
    $scope.aux.errors = null;
    var params = {
      user: $scope.user,
      changeUsername: $scope.aux.changeUsername
    }
    $http.post('/settings', params).success(function(data) {
      console.log(data)
      if (data.passed) {
        $scope.aux.showSuccess = true
      } else {
        $scope.aux.errors = data.errors
      }
    });
  };

}]);