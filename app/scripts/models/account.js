'use strict';

angular.module('configurationApp')
  .factory('Account', function(AccountAuthentication, Differ, Options, $q) {
    var defaults = {
      plex: {
        authorization: {
          basic: { valid: false }
        }
      },
      trakt: {
        authorization: {
          basic: { valid: false },
          oauth: { valid: false }
        }
      }
    };

    function Account(data) {
      this.authentication = new AccountAuthentication();
      this.options = null;

      this.id = null;
      this.name = null;

      this.thumb_url = null;

      // Update with initial data
      this.update(data);
    }

    Account.prototype.current = function() {
      var self = this,
          promises = [
            this.authentication.plex.current(),
            this.authentication.trakt.current()
          ];

      return $q.all(promises).then(function(results) {
        var current = {
          name: self.name
        };

        _.each(results, function(result) {
          $.extend(true, current, result);
        });

        return current;
      }, function(error) {
        return $q.reject(error);
      });
    };

    Account.prototype.update = function(data) {
      // Set defaults
      data = $.extend(true, angular.copy(defaults), data);

      // Copy original values for the differ
      this.data = angular.copy(data);

      // Update attributes
      this.id = data.id;
      this.name = data.name;

      this.thumb_url = data.thumb_url;

      this.authentication.update(data);
    };

    Account.prototype.refresh = function(server) {
      var self = this;

      // Retrieve account options
      return $q.all([
        server.call('account.get', [], {full: true, id: self.id}).then(function(data) {
          self.update(data);
        }),
        server.call('option.list', [], {account: self.id}).then(function(options) {
          self.options = new Options(options, self);
        })
      ]);
    };

    Account.prototype.discard = function() {
      // Discard account authentication/details
      this.update(this.data);

      // Discard account options
      return this.options.discard();
    };

    Account.prototype.save = function(server) {
      var self = this;

      // Save account changes
      return $q.all([
        // account
        this.current().then(function(data) {
          return server.call('account.update', [], {id: self.id, data: data}).then(function(account) {
            self.update(account);
          }, function() {
            return $q.reject();
          });
        }, function() {
          return $q.reject();
        }),

        // options
        this.options.save(server)
      ]);
    };

    return Account;
  });
