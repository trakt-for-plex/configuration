'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:AccountsController
 * @description
 * # AccountsController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('AccountsController', function (Account, $location, $q, $rootScope, $routeParams, $scope, $timeout) {
    var $actions = $('.accounts .list .actions'),
        $accountActions = $('.accounts .options .actions'),
        bRefresh = Ladda.create($('.refresh', $actions)[0]),
        bAccountRefresh = Ladda.create($('.refresh', $accountActions)[0]),
        bAccountDiscard = Ladda.create($('.discard', $accountActions)[0]),
        bAccountSave = Ladda.create($('.save', $accountActions)[0]);

    $scope.accounts = {};
    $scope.account = null;

    function selectAccount(id) {
      id = parseInt(id);

      if(id === null || isNaN(id)) {
        $scope.account = null;
        return;
      }

      // Set current account
      $scope.account = $scope.accounts[id];

      // Initial account preferences refresh
      $scope.accountRefresh();
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

    $scope.accountRefresh = function() {
      bAccountRefresh.start();

      $scope.account.refresh($rootScope.$s).then(function() {
        bAccountRefresh.stop();
      }, function() {
        bAccountRefresh.stop();
      })
    };

    $scope.accountDiscard = function() {
      bAccountDiscard.start();

      $scope.account.discard();

      bAccountDiscard.stop();
    };

    $scope.accountSave = function() {
      bAccountSave.start();

      $scope.account.save($rootScope.$s).then(function() {

      }, function() {

      });
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
      bRefresh.start();

      // Retrieve accounts from server
      $rootScope.$s.call('account.list', [], {full: true}).then(function (accounts) {
        // Parse accounts
        $scope.accounts = _.indexBy(_.map(_.filter(accounts, function (account) {
          return account.id > 0;
        }), function (account) {
          return new Account(account);
        }), function (account) {
          return account.id;
        });

        // Trigger initial account load
        select();

        bRefresh.stop();
      });
    };

    // Initial account refresh
    $scope.refresh();

    // Watch for selected account change
    $scope.$on("$routeUpdate", function() {
      select();
    });
  });
