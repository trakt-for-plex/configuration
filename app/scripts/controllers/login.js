'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LoginController', function(PAuthentication, $location, $scope) {
    $scope.credentials = {
      username: null,
      password: null
    };

    $scope.submit = function() {
      PAuthentication.login($scope.credentials).then(function() {
        $location.path($scope.$r.originalPath);
      }, function() {
        console.log('login error');
      });
    };
  });
