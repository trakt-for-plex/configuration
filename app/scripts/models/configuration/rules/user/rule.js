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

    UserRule.prototype.discard = function() {
      if(this.id === null) {
        this.delete();
      } else {
        this.update(this.original);
      }
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

    UserRule.prototype.current = function() {
      return {
        id:       this.id,

        name:     this.name,

        account:  this.account.id,
        priority: this.priority
      };
    };

    UserRule.prototype.update = function(data) {
      this.original = angular.copy(data);

      this.id = typeof data.id !== 'undefined' ? data.id : null;

      this.name = attributeValue(data.name);

      this.account = parseAccount(data);
      this.priority = data.priority;
    };

    return UserRule;
  });
