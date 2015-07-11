'use strict';

/**
 * @ngdoc function
 * @name configurationApp.controller:RulesController
 * @description
 * # RulesController
 * Controller of the configurationApp
 */
angular.module('configurationApp')
  .controller('RulesController', function (ClientRuleCollection, UserRuleCollection, $q, $rootScope, $scope) {
    var operations = [
      {
        $order: 1,

        value: '@',
        text: 'Map'
      }
    ];

    $scope.client = new ClientRuleCollection();
    $scope.user = new UserRuleCollection();

    $scope.refresh = function() {
      var promises = [
        // Retrieve accounts
        $rootScope.$s.call('account.list').then(function(accounts) {
          // Only return actual accounts
          $scope.accounts = [].concat(operations, _.map(_.filter(accounts, function (account) {
            return account.id > 0;
          }), function(account) {
            return {
              $order: 10,
              type: 'name',

              value: account.id,
              text: account.name
            }
          }));

          console.log('accounts', $scope.accounts);
        }, function() {
          return $q.reject('Unable to retrieve accounts');
        }),

        // Refresh rule collections
        $scope.client.refresh(),
        $scope.user.refresh()
      ];

      return $q.all(promises).then(function() {
        console.log('refreshed');
      });
    };

    $scope.attributeLabel = function(value) {
      if(value === null || value === '*') {
        return 'Any';
      }

      if(value === '@') {
        return 'Map';
      }

      return value;
    };

    // Initial rules refresh
    $scope.refresh();
  });
