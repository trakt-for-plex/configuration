'use strict';

angular.module('configurationApp')
  .factory('AccountAuthentication', function(PUsers, $q) {
    var tr = new trakt(
      'c9ccd3684988a7862a8542ae0000535e0fbd2d1c0ca35583af7ea4e784650a61',
      'bf00575b1ad252b514f14b2c6171fe650d474091daad5eb6fa890ef24d581f65'
    );

    //
    // PlexAuthentication
    //

    function PlexAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;
      this.valid = false;
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
          deferred = $q.defer();

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
      }).error(function() {
        deferred.reject();
      });

      return deferred.promise;
    };

    PlexAuthentication.prototype.update = function(data) {
      this.data = angular.copy(data);

      this.id = data.id;
      this.username = data.username;

      this.authorization = data.authorization;
      this.valid = false;
    };

    PlexAuthentication.prototype.validate = function() {
      this.valid =
        this.authorization.basic.valid;
    };

    //
    // TraktAuthentication
    //

    function TraktAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;
      this.valid = false;
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
      this.valid = false;
    };

    TraktAuthentication.prototype.validate = function() {
      this.valid =
        this.authorization.basic.valid ||
        this.authorization.oauth.valid;
    };

    //
    // AccountAuthentication
    //

    function AccountAuthentication() {
      this.plex = new PlexAuthentication();
      this.trakt = new TraktAuthentication();

      this.valid = false;
    }

    AccountAuthentication.prototype.update = function(data) {
      // Update handlers
      this.plex.update(data.plex);
      this.trakt.update(data.trakt);

      // Validate current authentication
      this.validate();
    };

    AccountAuthentication.prototype.validate = function() {
      this.plex.validate();
      this.trakt.validate();

      this.valid = this.plex.valid && this.trakt.valid;
    };

    return AccountAuthentication;
  });
