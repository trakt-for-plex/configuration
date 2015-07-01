'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LoginController', function(PlexAuthentication, $location, $scope) {
    $scope.credentials = {
      username: null,
      password: null
    };

    $scope.submit = function() {
      PlexAuthentication.login($scope.credentials).then(function() {
        $location.path($scope.$a.originalPath);
      }, function() {
        console.log('login error');
      });
    };
  });
