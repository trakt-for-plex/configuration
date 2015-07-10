'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:AccountsController
 * @description
 * # AccountsController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('AccountsController', function (Account, $location, $q, $rootScope, $routeParams, $scope) {
    $scope.accounts = {};
    $scope.account = null;

    function selectAccount(id) {
      id = parseInt(id);

      if(id === null || isNaN(id)) {
        $scope.account = null;
        return $q.reject();
      }

      // Set current account
      $scope.account = $scope.accounts[id];

      // Initial account preferences refresh
      return $scope.accountRefresh();
    }

    function select() {
      if(typeof $routeParams.id !== 'undefined') {
        // Load account from parameter
        return selectAccount($routeParams.id);
      } else {
        // Load first account
        $location.search('id', Object.keys($scope.accounts)[0]);
        return $q.resolve();
      }
    }

    $scope.accountRefresh = function() {
      return $scope.account.refresh($rootScope.$s);
    };

    $scope.accountDiscard = function() {
      return $scope.account.discard();
    };

    $scope.accountSave = function() {
      return $scope.account.save($rootScope.$s);
    };

    $scope.create = function(name) {
      if(name === null || name === '') {
        return $q.reject('Name is required');
      }

      return $rootScope.$s.call('account.create', [], {name: name}).then(function() {
        // Refresh accounts
        $scope.refresh();
      }, function(error) {
        if(error === null || typeof error.message !== 'string') {
          return $q.reject('Unknown error');
        }

        return $q.reject(error.message);
      });
    };

    $scope.refresh = function() {
      // Retrieve accounts from server
      return $rootScope.$s.call('account.list', [], {full: true}).then(function (accounts) {
        // Parse accounts
        $scope.accounts = _.indexBy(_.map(_.filter(accounts, function (account) {
          return account.id > 0;
        }), function (account) {
          return new Account(account);
        }), function (account) {
          return account.id;
        });

        // Trigger initial account load
        return select();
      }, function() {
        return $q.reject();
      });
    };

    // Initial account refresh
    $scope.refresh();

    // Watch for selected account change
    $scope.$on("$routeUpdate", function() {
      select();
    });
  });
