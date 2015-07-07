'use strict';

angular.module('configurationApp')
  .factory('Account', function(Differ, Options) {
    function Account(data) {
      this.update(data);
    }

    Account.prototype.update = function(data) {
      data = this.defaults(data);

      this.data = $.extend(true, {}, data);

      this.id = data.id;
      this.name = data.name;

      this.plex = data.plex;
      this.trakt = data.trakt;

      this.options = null;

      this.validate();
    };

    Account.prototype.defaults = function(data) {
      return $.extend(true, {
        plex: {
          authorization: {
            basic: {
              valid: false
            }
          }
        },
        trakt: {
          authorization: {
            basic: {
              valid: false
            },
            oauth: {
              valid: false
            }
          }
        }
      }, data);
    };

    Account.prototype.validate = function() {
      // validate authorization
      this.plex.authorization.valid =
        this.plex.authorization.basic.valid;

      this.trakt.authorization.valid =
        this.trakt.authorization.basic.valid ||
        this.trakt.authorization.oauth.valid;

      this.valid =
        this.trakt.authorization.valid &&
        this.plex.authorization.valid;
    };

    Account.prototype.changes = function() {
      var current = {
        id: this.id,
        name: this.name,

        plex: {
          authorization: {
            basic: {
              username: this.plex.authorization.basic.username,
              password: this.plex.authorization.basic.password
            }
          }
        },
        trakt: {
          authorization: {
            basic: {
              username: this.trakt.authorization.basic.username,
              password: this.trakt.authorization.basic.password
            },
            oauth: {
              code: this.trakt.authorization.oauth.code
            }
          }
        }
      };

      var result = Differ.run(current, this.data);

      // set defaults
      result = $.extend(true, {
        plex: {
          authorization: {}
        },
        trakt: {
          authorization: {}
        }
      }, result);

      // group authorization methods together in changes
      if(result.plex.authorization.basic !== undefined) {
        result.plex.authorization.basic = this.plex.authorization.basic;
      }

      if(result.trakt.authorization.basic !== undefined) {
        result.trakt.authorization.basic = this.trakt.authorization.basic;
      }

      if(result.trakt.authorization.oauth !== undefined) {
        result.trakt.authorization.oauth = this.trakt.authorization.oauth;
      }

      // remove empty objects
      if(Object.keys(result.plex.authorization).length === 0) {
        delete result.plex;
      }

      if(Object.keys(result.trakt.authorization).length === 0) {
        delete result.trakt;
      }

      return result;
    };

    Account.prototype.refresh = function(server) {
      var self = this;

      // TODO get account details
      // TODO this.validate();

      // Retrieve account options
      return server.call('option.list', [], {account: self.id}).then(function(options) {
        self.options = new Options(options, self);
      });
    };

    Account.prototype.discard = function() {
      // TODO discard account authorization

      // Discard account options
      return this.options.discard();
    };

    Account.prototype.save = function(server) {
      console.log(this.changes());

      // Save account options
      return this.options.save(server);
    };

    return Account;
  });
