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
      this.collection.reset();

      this.state = 'edit';
    };

    UserRule.prototype.focus = function() {
      if(typeof this.priority === 'undefined' || this.priority === null) {
        return;
      }

      var $tr = $('.rules .users .rule.p-' + this.priority);

      if($tr === null || $tr.length === 0) {
        console.warn('Unable to find TR element for rule', this);
        return;
      }

      console.log($tr);

      $('td.account input', $tr).focus();
    };

    UserRule.prototype.save = function() {
      this.state = 'view';

      // Update account name
      var account = this.collection.accountsById[this.account.id];

      if(typeof account === 'undefined') {
        this.account.name = 'None';
      } else {
        this.account.name = account.text;
      }
    };

    function parseAccount(data) {
      if(data.account_function === '@') {
        return {
          id: '@',
          name: 'Map'
        }
      }

      if(typeof data.account !== 'undefined' && data.account !== null) {
        return data.account;
      }

      return {
        id: '-',
        name: 'None'
      };
    }

    function attributeValue(value) {
      if(value === null) {
        // Any
        return '*';
      }

      return value;
    }

    UserRule.prototype.current = function() {
      var data = {
        id:       this.id,

        name:     this.name,

        account: null,
        account_function: null,

        priority: this.priority
      };

      // Parse account field
      if(this.account.id === '-') {
        data['account'] = null;
      } else if(this.account.id === '@') {
        data['account_function'] = '@';
      } else {
        data['account'] = this.account.id;
      }

      return data;
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
