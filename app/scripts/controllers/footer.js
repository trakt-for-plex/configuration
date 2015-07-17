'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:FooterController
 * @description
 * # FooterController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('FooterController', function($scope) {
    $scope.connectionVisible = false;
    $scope.versionVisible = false;

    $scope.toggleConnection = function(parameter) {
      $scope.connectionVisible = !$scope.connectionVisible;
    };

    $scope.toggleVersion = function() {
      $scope.versionVisible = !$scope.versionVisible;
    };
  });
