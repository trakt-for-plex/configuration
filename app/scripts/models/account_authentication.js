'use strict';

angular.module('configurationApp')
  .factory('AccountAuthentication', function(PUsers, $q) {
    var stateIds = {
          'valid':    0,
          'warning':  1,
          'error':    2,
          'empty':    3
        },
        stateKeys = {
          0: 'valid',
          1: 'warning',
          2: 'error',
          3: 'empty'
        },
        tr = new trakt.Client(
          'c9ccd3684988a7862a8542ae0000535e0fbd2d1c0ca35583af7ea4e784650a61',
          'bf00575b1ad252b514f14b2c6171fe650d474091daad5eb6fa890ef24d581f65'
        );

    function selectPriorityState(states, type) {
      type = typeof type !== 'undefined' ? type : 'top';

      if(states.length === 0) {
        return null;
      }

      // Ensure states are unique
      states = _.uniq(states);

      if(states.length === 1) {
        return states[0];
      }

      // Map states to sort indices
      var ids =_.map(states, function(key) {
        return stateIds[key];
      });

      // Sort state indices
      ids = _.sortBy(ids, function(id) { return id; });

      // Retrieve highest priority state
      var id;

      if(type === 'top') {
        id = ids[0];
      } else if(type === 'bottom') {
        id = ids[ids.length - 1];
      } else {
        console.warn('Unknown "type" provided for selectPriorityState()');
        return null;
      }

      // Map id to state key
      return stateKeys[id];
    }

    //
    // PlexAuthentication
    //

    function PlexAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;

      this.errors = [];
      this.state = '';
    }

    PlexAuthentication.prototype.basicChanged = function() {
      var current = this.authorization.basic,
          original = this.data.authorization.basic;

      if(current.username !== original.username) {
        return true;
      }

      if(current.password !== original.password) {
        return true;
      }

      return false;
    };

    PlexAuthentication.prototype.current = function() {
      if(!this.basicChanged()) {
        return $q.resolve({});
      }

      var current = this.authorization.basic,
          deferred = $q.defer(),
          self = this;

      // Reset message
      this.errors = [];

      // Send request
      PUsers.sign_in({
        username: current.username,
        password: current.password
      }).success(function(data) {
        var user = data.user;

        deferred.resolve({
          plex: {
            username: user.username,

            authorization: {
              basic: {
                token: user._authenticationToken
              }
            }
          }
        });
      }).error(function(data, status) {
        // Update errors
        if(typeof data !== 'undefined' && data !== null) {
          self.errors = typeof data.errors.error === 'object' ? data.errors.error : [data.errors.error];
        } else {
          self.errors = ['HTTP Error: ' + status];
        }

        // Update state
        self.state = 'error';

        deferred.reject();
      });

      return deferred.promise;
    };

    PlexAuthentication.prototype.update = function(data) {
      this.data = angular.copy(data);

      this.id = data.id;
      this.username = data.username;

      this.authorization = data.authorization;
      this.state = '';
    };

    PlexAuthentication.prototype.check = function() {
      this.state =
        this.authorization.basic.state;
    };

    //
    // TraktAuthentication
    //

    function TraktAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;
      this.state = '';
    }

    TraktAuthentication.prototype.basicChanged = function() {
      var current = this.authorization.basic,
          original = this.data.authorization.basic;

      if(current.username !== original.username) {
        return true;
      }

      if(current.password !== original.password) {
        return true;
      }

      return false;
    };

    TraktAuthentication.prototype.oauthChanged = function() {
      var current = this.authorization.oauth,
          original = this.data.authorization.oauth;

      if(current.code !== original.code) {
        return true;
      }

      return false;
    };

    TraktAuthentication.prototype.current = function() {
      var promises = [];

      if(this.basicChanged()) {
        // Basic authorization
        var current = this.authorization.basic,
            original = this.data.authorization.basic,
            data = {
              trakt: {
                username: current.username
              }
            };

        if(current.password !== original.password) {
          // Only send "password" if it has changed
          data.trakt.authorization = {
            basic: {
              password: current.password
            }
          };
        }

        promises.push($q.when(data));
      }

      if(this.oauthChanged()) {
        // OAuth authorization
        var code = this.authorization.oauth.code;

        promises.push(
          tr.oauth.token(code).then(function(data) {
            return {
              trakt: {
                authorization: {
                  oauth: $.extend(data, {
                    code: code
                  })
                }
              }
            };
          }, function() {
            return $q.reject();
          })
        );
      }

      return $q.all(promises).then(function(results) {
        var data = {};

        _.each(results, function(result) {
          $.extend(true, data, result);
        });

        return data;
      }, function() {
        return $q.reject();
      });
    };

    TraktAuthentication.prototype.update = function(data) {
      this.data = angular.copy(data);

      this.id = data.id;
      this.username = data.username;

      this.authorization = data.authorization;
      this.state = '';
    };

    TraktAuthentication.prototype.check = function() {
      this.state = selectPriorityState([
        this.authorization.basic.state,
        this.authorization.oauth.state
      ]);
    };

    //
    // AccountAuthentication
    //

    function AccountAuthentication() {
      this.plex = new PlexAuthentication();
      this.trakt = new TraktAuthentication();

      this.state = '';
    }

    AccountAuthentication.prototype.update = function(data) {
      // Update handlers
      this.plex.update(data.plex);
      this.trakt.update(data.trakt);

      // Check current authentication
      this.check();
    };

    AccountAuthentication.prototype.check = function() {
      this.plex.check();
      this.trakt.check();

      this.state = selectPriorityState([
        this.plex.state,
        this.trakt.state
      ], 'bottom');
    };

    return AccountAuthentication;
  });
