'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:RulesController
 * @description
 * # RulesController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('RulesController', function ($rootScope, $scope) {
    $scope.refresh = function() {
      // Retrieve rules
      return $rootScope.$s.call('rule.list', [], {full: true}).then(function(rules) {
        $scope.rules = rules;

        console.log($scope.rules);
      }, function() {
        return $q.reject();
      });
    };

    // Initial rules refresh
    $scope.refresh();
  });
