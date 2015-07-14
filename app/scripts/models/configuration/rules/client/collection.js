'use strict';

angular.module('configurationApp')
  .factory('ClientRuleCollection', function(ClientRule, $q, $rootScope) {
    var attributeFunctions = [
          { $order: 1, value: '*', text: 'Any' }
        ];

    function ClientRuleCollection() {
      this.available = {
        keys: null,
        names: null,
        addresses: null
      };

      this.accounts = null;
      this.rules = null;
    }

    ClientRuleCollection.prototype.create = function() {
      this.rules.push(new ClientRule(
        this,
        {
          key: '*',
          name: '*',
          address: '*',

          priority: this.rules.length + 1
        },
        'edit'
      ));
    };

    ClientRuleCollection.prototype.delete = function(rule) {
      var index = this.rules.indexOf(rule);

      if(index === -1) {
        return;
      }

      // Delete rule from collection
      this.rules.splice(index, 1);

      // Update rule priorities
      this.updatePriorities();
    };

    ClientRuleCollection.prototype.refresh = function() {
      var self = this;

      return $q.all([
        // Retrieve seen clients
        $rootScope.$s.call('session.client.list').then(
          $.proxy(self.updateClients, self),
          function() {
            return $q.reject('Unable to retrieve clients');
          }
        ),

        // Retrieve client rules
        $rootScope.$s.call('session.client.rule.list', [], {full: true}).then(
          $.proxy(self.updateRules, self),
          function() {
            return $q.reject('Unable to retrieve client rules');
          }
        )
      ]);
    };

    ClientRuleCollection.prototype.discard = function() {
      // Discard rule changes
      _.each(this.rules.slice(), function(rule) {
        rule.discard();
      });

      // Update rule priorities
      this.updatePriorities();

      return $q.resolve();
    };

    ClientRuleCollection.prototype.save = function() {
      var current = _.map(this.rules, function(rule) {
        return rule.current();
      });

      return $rootScope.$s.call('session.client.rule.update', [], {current: current, full: true}).then(
        $.proxy(self.updateRules, self),
        function() {
          return $q.reject('Unable to update client rules');
        }
      );
    };

    ClientRuleCollection.prototype.updateAccounts = function(accounts) {
      this.accounts = accounts;
    };

    ClientRuleCollection.prototype.updateClients = function(clients) {
      // Build collection of client keys
      this.available.keys = [].concat(attributeFunctions, _.map(clients, function (client) {
        return {
          $order: 10,
          type: 'key',

          value: client.key,
          text: client.key
        };
      }));

      // Build collection of client names
      this.available.names = [].concat(attributeFunctions, _.map(clients, function (client) {
        return {
          $order: 10,
          type: 'name',

          value: client.name,
          text: client.name
        };
      }));

      // Build collection of client addresses
      this.available.addresses = [].concat(attributeFunctions, _.map(clients, function (client) {
        return {
          $order: 10,
          type: 'address',

          value: client.address,
          text: client.address
        };
      }));
    };

    ClientRuleCollection.prototype.updatePriorities = function() {
      // Update rule priorities
      for(var i = 0; i < this.rules.length; ++i) {
        this.rules[i].priority = i + 1;
      }
    };

    ClientRuleCollection.prototype.updateRules = function(rules) {
      var self = this;

      // Parse rules
      this.rules = _.map(rules, function(rule) {
        return new ClientRule(self, rule);
      });
    };

    return ClientRuleCollection;
  });
