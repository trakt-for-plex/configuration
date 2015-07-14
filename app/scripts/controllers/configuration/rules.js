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

        // Update dragged item
        $item.removeClass(container.group.options.draggedClass).removeAttr("style");

        // Update cursor
        $("body").removeClass(container.group.options.bodyClass);

        // Retrieve collection
        var $table = $item.parents('table'),
            collectionName = $table.data('collection'),
            collection = null;

        if(collectionName === 'client') {
          collection = $scope.client;
        } else if(collectionName === 'user') {
          collection = $scope.user;
        } else {
          console.warn('Unable to find collection with the name "%s"', collectionName);
          return;
        }

        // Retrieve rule from `collection`
        var item = collection.rules[from];

        if(typeof item === 'undefined') {
          console.warn('Unable to retrieve item with index %s', from);
          return;
        }

        // Move rule inside `collection`
        collection.rules.splice(from, 1);
        collection.rules.splice(to, 0, item);

        // Update rule priorities
        collection.updatePriorities();

        $scope.$apply();
      }
    });

    $scope.refresh = function() {
      var promises = [
        // Retrieve accounts
        $rootScope.$s.call('account.list').then(function(accounts) {
          // Filter accounts (remove "server" account)
          accounts = _.filter(accounts, function (account) {
            return account.id > 0;
          });

          // Map accounts
          accounts = _.map(accounts, function(account) {
            return {
              $order: 10,
              type: 'name',

              value: account.id,
              text: account.name
            }
          });

          // Update collections
          $scope.client.updateAccounts(accounts);
          $scope.user.updateAccounts(accounts);
        }, function() {
          return $q.reject('Unable to retrieve accounts');
        }),

        // Refresh rule collections
        $scope.client.refresh(),
        $scope.user.refresh()
      ];

      return $q.all(promises);
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
