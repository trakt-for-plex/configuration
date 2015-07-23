'use strict';

angular.module('configurationApp')
  .factory('TraktAuthentication', function(BaseAuthentication, PUsers, $q) {
    var tr = new trakt.Client(
      'c9ccd3684988a7862a8542ae0000535e0fbd2d1c0ca35583af7ea4e784650a61',
      'bf00575b1ad252b514f14b2c6171fe650d474091daad5eb6fa890ef24d581f65'
    );

    function TraktAuthentication() {
      this.data = null;

      this.id = null;
      this.username = null;

      this.authorization = null;

      this.errors = [];
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
      var promises = [],
          self = this;

      // Reset errors
      this.errors = [];

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
          }, function(data, status) {
            // Update errors
            if(data.error === 'invalid_grant') {
              self.errors.push('Invalid authentication pin provided');
            } else if(typeof data.error_description !== 'undefined') {
              self.errors.push(data.error_description);
            } else if(typeof data.error !== 'undefined') {
              self.errors.push(data.error);
            } else {
              self.errors.push('HTTP Error: ' + status);
            }

            // Update state
            self.authorization.oauth.state = 'error';

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
        // Update state
        self.state = 'error';

        return $q.reject();
      });
    };

    TraktAuthentication.prototype.update = function(data) {
      this.data = angular.copy(data);

      this.id = data.id;
      this.username = data.username;

      this.authorization = data.authorization;

      this.errors = [];
      this.state = '';
    };

    TraktAuthentication.prototype.check = function() {
      this.state = BaseAuthentication.selectPriorityState([
        this.authorization.basic.state,
        this.authorization.oauth.state
      ]);
    };

    return TraktAuthentication;
  });
