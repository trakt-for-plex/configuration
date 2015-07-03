'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:ServerController
 * @description
 * # ServerController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('ServerController', function ($rootScope, $scope) {
    $scope.groups = {};

    function parseOptions(groups, options) {
      for(var i = 0; i < options.length; ++i) {
        var option = options[i],
          groupName = option.group[0],
          group = groups[groupName];

        if(typeof group === 'undefined') {
          group = groups[groupName] = {
            name: groupName,
            groups: {},

            options: []
          };
        }

        if(option.group.length === 1) {
          group.options.push(option);
        } else {
          var o = angular.copy(option);

          // Remove first group name
          o.group.shift();

          parseOptions(group.groups, [o]);
        }
      }
    }

    $rootScope.$s.call('preferences.list', []).then(function(result) {
      $scope.groups = {};

      parseOptions($scope.groups, result.options);

      console.log($scope.groups);
    });
  });
