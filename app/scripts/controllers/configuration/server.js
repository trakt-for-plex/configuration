'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:ServerController
 * @description
 * # ServerController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('ServerController', function (Options, $rootScope, $scope) {
    var $actions = $('.options .actions'),
      bRefresh = Ladda.create($('.refresh', $actions)[0]),
      bDiscard = Ladda.create($('.discard', $actions)[0]),
      bSave = Ladda.create($('.save', $actions)[0]);

    $scope.options = null;

    $scope.refresh = function() {
      bRefresh.start();

      // Retrieve server options
      $rootScope.$s.call('option.list', []).then(function(options) {
        // Parse options
        $scope.options = new Options(options);

        bRefresh.stop();
      }, function() {
        bRefresh.stop();
      });
    };

    $scope.discard = function() {
      $scope.options.discard();
    };

    $scope.save = function() {
      $scope.options.save($rootScope.$s);
    };

    // Initial preferences refresh
    $scope.refresh();
  });
