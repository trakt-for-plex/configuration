'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('LoginController', function(Authentication, $location, $scope) {
    $scope.credentials = {
      username: null,
      password: null
    };

    $scope.submit = function() {
      Authentication.login($scope.credentials).then(function() {
        $scope.$r.redirect();
      }, function() {
        console.log('login error');
      });
    };
  });
