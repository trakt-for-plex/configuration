'use strict';

angular.module('configurationApp')
  .factory('ClientRuleCollection', function(ClientRule, $q, $rootScope) {
    var operations = [
      {
        $order: 1,

        value: '*',
        text: 'Any'
      },
      {
        $order: 2,

        value: '@',
        text: 'Map'
      }
    ];

    function ClientRuleCollection() {
      this.available = {
        keys: null,
        names: null,
        addresses: null
      };

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

      this.rules.splice(index, 1);
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
        $rootScope.$s.call('rule.list', [], {type: 'client', full: true}).then(
          $.proxy(self.updateRules, self),
          function() {
            return $q.reject('Unable to retrieve client rules');
          }
        )
      ]);
    };

    ClientRuleCollection.prototype.updateClients = function(clients) {
      // Build collection of client keys
      this.available.keys = [].concat(operations, _.map(clients, function (client) {
        return {
          $order: 10,
          type: 'key',

          value: client.key,
          text: client.key
        };
      }));

      console.log('client - keys', this.available.keys);

      // Build collection of client names
      this.available.names = [].concat(operations, _.map(clients, function (client) {
        return {
          $order: 10,
          type: 'name',

          value: client.name,
          text: client.name
        };
      }));

      console.log('client - names', this.available.names);

      // Build collection of client addresses
      this.available.addresses = [].concat(operations, _.map(clients, function (client) {
        return {
          $order: 10,
          type: 'address',

          value: client.address,
          text: client.address
        };
      }));

      console.log('client - addresses', this.available.addresses);
    };

    ClientRuleCollection.prototype.updateRules = function(rules) {
      var self = this;

      // Parse rules
      this.rules = _.map(rules, function(rule) {
        return new ClientRule(self, rule);
      });

      console.log('client - rules', this.rules);
    };

    return ClientRuleCollection;
  });
