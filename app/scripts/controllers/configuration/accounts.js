'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:AccountsController
 * @description
 * # AccountsController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('AccountsController', function (Account, Option, $location, $rootScope, $routeParams, $scope) {
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

      // Update account status
      updateAccount($scope.account);

      // Retrieve account options
      $rootScope.$s.call('option.list', [], {account: id}).then(function(options) {
        $scope.account.preferences = {};

        Option.parse($scope.account.preferences, options);
      });
    }

    function updateAccount(account) {
      var trakt = account.trakt,
          plex = account.plex;

      // Update trakt authentication status
      trakt.authorization.valid =
        trakt.authorization.basic.valid ||
        trakt.authorization.oauth.valid;

      plex.authorization.valid =
        plex.authorization.basic.valid;
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
      $scope.accounts = _.indexBy(_.map(_.filter(accounts, function(account) {
        return account.id > 0;
      }), function(account) {
        return new Account(account);
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
