'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:AccountsController
 * @description
 * # AccountsController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('AccountsController', function (Option, $location, $rootScope, $routeParams, $scope) {
    $scope.accounts = {};
    $scope.account = null;

    function selectAccount(id) {
      id = parseInt(id);

      if(id === null || isNaN(id)) {
        $scope.account = null;
        return;
      }

      console.log('select(%s)', id);

      // Set current account
      $scope.account = $scope.accounts[id];

      console.log('account', $scope.account);

      // Retrieve account options
      $rootScope.$s.call('option.list', [], {account: id}).then(function(options) {
        $scope.account.preferences = {};

        Option.parse($scope.account.preferences, options);
      });
    }

    function select() {
      if(typeof $routeParams.id !== 'undefined') {
        // Load account from parameter
        selectAccount($routeParams.id);
      } else {
        // Load first account
        $location.search('id', Object.keys($scope.accounts)[0]);
      }
    }

    // Retrieve accounts from server
    $rootScope.$s.call('account.list', [], {full: true}).then(function(accounts) {
      // Parse accounts
      $scope.accounts = _.indexBy(_.filter(accounts, function(account) {
        return account.id > 0;
      }), function(account) {
        return account.id;
      });

      // Trigger initial account load
      select();
    });

    // Watch for selected account change
    $scope.$on("$routeUpdate", function() {
      select();
    });
  });
