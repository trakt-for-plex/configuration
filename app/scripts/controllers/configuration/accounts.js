'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:AccountsController
 * @description
 * # AccountsController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('AccountsController', function (Account, Utils, $location, $modal, $q, $rootScope, $routeParams, $scope) {
    $scope.accounts = {};
    $scope.account = null;

    function selectAccount(id) {
      id = parseInt(id);

      if(id === null || isNaN(id)) {
        $scope.account = null;
        return $q.reject();
      }

      if(Utils.isDefined($scope.accounts[id])) {
        // Set current account
        $scope.account = $scope.accounts[id];
      } else if(Object.keys($scope.accounts).length > 0) {
        // Missing account, select the first account
        return selectFirstAccount();
      } else {
        return $q.reject();
      }

      // Initial account preferences refresh
      return $scope.accountRefresh();
    }

    function selectFirstAccount() {
      // Update selected account parameter
      $location.search('id', Object.keys($scope.accounts)[0]);

      return $q.resolve();
    }

    function select() {
      if(typeof $routeParams.id !== 'undefined') {
        // Load account from parameter
        return selectAccount($routeParams.id);
      }

      // Load first account
      return selectFirstAccount();
    }

    $scope.accountRefresh = function() {
      if(typeof $scope.account === 'undefined' || $scope.account === null) {
        // Currently selected account has been removed
        return $q.reject();
      }

      return $scope.account.refresh($rootScope.$s);
    };

    $scope.accountDiscard = function() {
      return $scope.account.discard();
    };

    $scope.accountSave = function() {
      return $scope.account.save($rootScope.$s);
    };

    $scope.accountDelete = function() {
      var modal = $modal.open({
        templateUrl: 'modals/deleteAccount.html',
        windowClass: 'small',
        scope: $scope
      });

      return modal.result.then(function() {
        return $scope.account.delete($rootScope.$s).then(function () {
          // Refresh accounts
          return $scope.refresh();
        });
      });
    };

    $scope.create = function(name) {
      if(name === null || name === '') {
        return $q.reject('Name is required');
      }

      return $rootScope.$s.call('account.create', [], {name: name}).then(function() {
        // Refresh accounts
        return $scope.refresh();
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
          return account.id > 0 && !account.deleted;
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
