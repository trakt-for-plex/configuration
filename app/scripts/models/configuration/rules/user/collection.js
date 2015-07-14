'use strict';

angular.module('configurationApp')
  .factory('UserRuleCollection', function(UserRule, $q, $rootScope) {
    var accountFunctions = [
          { $order: 1, value: '-', text: 'None' },
          { $order: 2, value: '@', text: 'Map' }
        ],
        attributeFunctions = [
          { $order: 1, value: '*', text: 'Any' },
          { $order: 2, value: '@', text: 'Map' }
        ];

    function UserRuleCollection() {
      this.available = {
        names: null
      };

      this.rules = null;
    }

    UserRuleCollection.prototype.create = function() {
      this.rules.push(new UserRule(
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
      ));
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

    UserRuleCollection.prototype.discard = function() {
      // Discard rule changes
      _.each(this.rules.slice(), function(rule) {
        rule.discard();
      });

      // Update rule priorities
      this.updatePriorities();

      return $q.resolve();
    };

    UserRuleCollection.prototype.save = function() {
      var current = _.map(this.rules, function(rule) {
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
    };

    UserRuleCollection.prototype.updatePriorities = function() {
      // Update rule priorities
      for(var i = 0; i < this.rules.length; ++i) {
        this.rules[i].priority = i + 1;
      }
    };

    UserRuleCollection.prototype.updateRules = function(rules) {
      var self = this;

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
