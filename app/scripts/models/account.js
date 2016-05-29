'use strict';

angular.module('configurationApp')
  .factory('Account', function(AccountAuthentication, Differ, Options, Utils, $q) {
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

      this.original = null;
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
      this.original = angular.copy(data);

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

    Account.prototype.delete = function(server) {
      var self = this;

      return server.call('account.delete', [], {id: self.id}).then(function(success) {
        if(!success) {
          return $q.reject();
        }
      });
    };

    Account.prototype.discard = function() {
      // Discard account authentication/details
      this.update(this.original);

      // Discard account options
      return this.options.discard();
    };

    Account.prototype.save = function(server) {
      var self = this;

      // Clear authentication errors
      this.authentication.clear();

      // Save account changes
      return $q.all([
        // Update account details
        this.current().then(function(data) {
          // Send changes to server
          return server.call('account.update', [], {id: self.id, data: data})
            .then(function(account) {
              // Account updated successfully, update local data
              self.update(account);
            });
        }),

        // Update account options
        this.options.save(server)
      ]).catch(function(error) {
        // Unable to save changes to server
        self.handleError(error);
        return $q.reject(error);
      });
    };

    Account.prototype.handleError = function(error) {
      if(!Utils.isDefined(error) || !Utils.isDefined(error.code) || !Utils.isDefined(error.message)) {
        return;
      }

      // Process error
      if(error.code.indexOf("error.account.trakt.") == 0) {
        this.authentication.trakt.onSaveError(error);
      } else if(error.code.indexOf("error.account.plex.") == 0) {
        this.authentication.plex.onSaveError(error);
      } else {
        this.authentication.onSaveError(error);
      }

      // Check current authentication state
      this.authentication.check();
    };

    return Account;
  });
