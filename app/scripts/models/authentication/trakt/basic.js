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
      this.messages = [];
      this.state = '';
    }

    TraktBasicAuthentication.prototype.appendMessage = function(type, content) {
      this.messages.push({
        type: type,
        content: content
      });
    };

    TraktBasicAuthentication.prototype.current = function() {
      return {
        username: this.username,

        authorization: {
          basic: {
            password: this.password
          }
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
      this.messages = [];
      this.state = data.state;
    };

    TraktBasicAuthentication.prototype.updateAuthorization = function() {
      // Clear messages
      this.messages = [];

      // Set `changed` flag
      this.changed = true;

      // Update messages
      this.appendMessage('info', "Account details are unavailable until changes have been saved");
    };

    return TraktBasicAuthentication;
  });
