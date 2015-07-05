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
    $scope.visible = false;

    $scope.toggle = function() {
      $scope.visible = !$scope.visible;
    }
  });
