'use strict';

angular.module('configurationApp')
  .factory('Account', function() {
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

      var result = diff(current, this.data);

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

      return result;
    };

    Account.prototype.save = function() {
    };

    return Account;
  });
