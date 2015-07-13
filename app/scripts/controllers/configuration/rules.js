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

    // Setup sortable rule tables
    $('.rules table').sortable({
      handle: 'a.move',

      containerSelector: 'table',
      itemPath: '> tbody',
      itemSelector: 'tr',
      placeholder: '<tr class="placeholder"/>',

      onDragStart: function($item, container, _super) {
        var node = $item[0],
          tbody = node.parentNode,
          index = Array.prototype.indexOf.call(tbody.children, $item[0]);

        $item.addClass(container.group.options.draggedClass);
        $("body").addClass(container.group.options.bodyClass);

        $item.data('drag-from', index);
      },
      onDrop: function($item, container, _super) {
        var node = $item[0],
          tbody = node.parentNode,
          from = $item.data('drag-from'),
          to = Array.prototype.indexOf.call(tbody.children, $item[0]);

        $item.removeClass(container.group.options.draggedClass).removeAttr("style");
        $("body").removeClass(container.group.options.bodyClass);

        console.log('onDrop', from, to);
      }
    });

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
