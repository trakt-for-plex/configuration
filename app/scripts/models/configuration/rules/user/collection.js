'use strict';

angular.module('configurationApp')
  .factory('UserRuleCollection', function(UserRule, $q, $rootScope, $timeout) {
    var accountFunctions = [
          { $order: 1, value: '-', text: 'None' },
          { $order: 2, value: '@', text: 'Map' }
        ],
        attributeFunctions = [
          { $order: 1, value: '*', text: 'Any' }
        ];

    function UserRuleCollection() {
      this.available = {
        names: null
      };

      this.accounts = null;
      this.accountsById = null;

      this.original = null;
      this.rules = null;
    }

    UserRuleCollection.prototype.create = function() {
      // Reset rule states to "view"
      this.reset();

      // Create new rule
      var rule = new UserRule(
        this,
        {
          name: '*',

          account: {
            id: '-',
            name: 'None'
          },
          priority: this.rules.length + 1
        },
        'edit'
      );

      this.rules.push(rule);

      // Focus new rule
      $timeout(function() {
        rule.focus();
      })
    };

    UserRuleCollection.prototype.delete = function(rule) {
      var index = this.rules.indexOf(rule);

      if(index === -1) {
        return;
      }

      // Delete rule from collection
      this.rules.splice(index, 1);

      // Update rule priorities
      this.updatePriorities();
    };

    UserRuleCollection.prototype.discard = function() {
      // Discard rule changes
      this.updateRules(this.original);

      // Update rule priorities
      this.updatePriorities();

      return $q.resolve();
    };

    UserRuleCollection.prototype.refresh = function() {
      var self = this;

      return $q.all([
        // Retrieve seen users
        $rootScope.$s.call('session.user.list').then(
          $.proxy(self.updateUsers, self),
          function() {
            return $q.reject('Unable to retrieve users');
          }
        ),

        // Retrieve user rules
        $rootScope.$s.call('session.user.rule.list', [], {full: true}).then(
          $.proxy(self.updateRules, self),
          function() {
            return $q.reject('Unable to retrieve user rules');
          }
        )
      ]);
    };

    UserRuleCollection.prototype.reset = function() {
      // Reset rules back to view mode
      _.each(this.rules, function(rule) {
        rule.save();
      });
    };

    UserRuleCollection.prototype.save = function() {
      var self = this,
          current = _.map(this.rules, function(rule) {
            return rule.current();
          });

      return $rootScope.$s.call('session.user.rule.update', [], {current: current, full: true}).then(
        $.proxy(self.updateRules, self),
        function() {
          return $q.reject('Unable to update user rules');
        }
      );
    };

    UserRuleCollection.prototype.updateAccounts = function(accounts) {
      this.accounts = [].concat(accountFunctions, accounts);

      this.accountsById = _.indexBy(this.accounts, 'value');
    };

    UserRuleCollection.prototype.updatePriorities = function() {
      // Update rule priorities
      for(var i = 0; i < this.rules.length; ++i) {
        this.rules[i].priority = i + 1;
      }
    };

    UserRuleCollection.prototype.updateRules = function(rules) {
      var self = this;

      // Store original rules
      this.original = angular.copy(rules);

      // Parse rules
      this.rules = _.map(rules, function(rule) {
        return new UserRule(self, rule);
      });
    };

    UserRuleCollection.prototype.updateUsers = function(users) {
      this.available.names = [].concat(attributeFunctions, _.map(users, function (user) {
        return {
          $order: 10,
          type: 'name',

          value: user.name,
          text: user.name
        };
      }));
    };

    return UserRuleCollection;
  });
