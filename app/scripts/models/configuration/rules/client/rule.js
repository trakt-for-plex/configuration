'use strict';

angular.module('configurationApp')
  .factory('ClientRule', function() {
    function ClientRule(collection, data, state) {
      this.collection = collection;

      this.id = null;

      this.key = null;
      this.name = null;
      this.address = null;

      this.account = null;
      this.priority = null;

      this.state = typeof state !== 'undefined' ? state: 'view';

      this.update(data);
    }

    ClientRule.prototype.delete = function() {
      this.collection.delete(this);
    };

    ClientRule.prototype.edit = function() {
      this.state = 'edit';
    };

    ClientRule.prototype.save = function() {
      this.state = 'view';
    };

    function parseAccount(data) {
      if(typeof data.account === 'undefined' || data.account === null) {
        return {
          id: null,
          name: null
        };
      }

      return data.account;
    }

    function attributeValue(value) {
      if(value === null) {
        // Any
        return '*';
      }

      return value;
    }

    ClientRule.prototype.update = function(data) {
      this.original = angular.copy(data);

      this.id = data.id;

      this.key = attributeValue(data.key);
      this.name = attributeValue(data.name);
      this.address = attributeValue(data.address);

      this.account = parseAccount(data);
      this.priority = data.priority;
    };

    return ClientRule;
  });
