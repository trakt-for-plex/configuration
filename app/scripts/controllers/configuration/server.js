'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:ServerController
 * @description
 * # ServerController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('ServerController', function (Options, $q, $rootScope, $scope) {
    $scope.options = null;

    $scope.refresh = function() {
      // Retrieve server options
      return $rootScope.$s.call('option.list', []).then(function(options) {
        // Parse options
        $scope.options = new Options(options);
      }, function() {
        return $q.reject();
      });
    };

    $scope.discard = function() {
      return $scope.options.discard();
    };

    $scope.save = function() {
      return $scope.options.save($rootScope.$s);
    };

    // Initial preferences refresh
    $scope.refresh();
  });
