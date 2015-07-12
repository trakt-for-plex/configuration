'use strict';

angular.module('configurationApp')
  .factory('UserRule', function() {
    function UserRule(collection, data, state) {
      this.collection = collection;

      this.id = null;

      this.name = null;

      this.account = null;
      this.priority = null;

      this.state = typeof state !== 'undefined' ? state: 'view';

      this.update(data);
    }

    UserRule.prototype.delete = function() {
      this.collection.delete(this);
    };

    UserRule.prototype.edit = function() {
      this.state = 'edit';
    };

    UserRule.prototype.save = function() {
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

    UserRule.prototype.update = function(data) {
      this.original = angular.copy(data);

      this.id = data.id;

      this.name = attributeValue(data.name);

      this.account = parseAccount(data);
      this.priority = data.priority;
    };

    return UserRule;
  });
