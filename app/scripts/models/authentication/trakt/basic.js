'use strict';

angular.module('configurationApp')
  .factory('TraktBasicAuthentication', function(BaseAuthentication, Utils, $q) {
    function TraktBasicAuthentication(main) {
      this.main = main;

      this.changed = false;
      this.original = null;

      // Authorization details
      this.username = null;
      this.password = null;

      // State
      this.state = '';
    }

    TraktBasicAuthentication.prototype.current = function() {
      return {
        basic: {
          username: this.username,
          password: this.password
        }
      };
    };

    TraktBasicAuthentication.prototype.update = function(data) {
      this.changed = false;
      this.original = angular.copy(data);

      // Authorization details
      this.username = data.username;
      this.password = data.password;

      // State
      this.state = data.state;
    };

    return TraktBasicAuthentication;
  });
