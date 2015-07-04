'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:ServerController
 * @description
 * # ServerController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('ServerController', function (Option, $rootScope, $scope) {
    $scope.preferences = {};

    $rootScope.$s.call('option.list', []).then(function(options) {
      $scope.preferences = {};

      Option.parse($scope.preferences, options);
    });
  });
