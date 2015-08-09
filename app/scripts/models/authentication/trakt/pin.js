'use strict';

angular.module('configurationApp')
  .factory('TraktPinAuthentication', function(BaseAuthentication, Utils, $q) {
    function TraktPinAuthentication(main) {
      this.main = main;

      this.changed = false;
      this.original = null;

      // Authorization details
      this.authorization = null;
      this.code = null;

      // State
      this.messages = [];
      this.state = '';
    }

    TraktPinAuthentication.prototype.current = function() {
      var authorization = this.authorization;

      if(!Utils.isDefined(authorization)) {
        return {};
      }

      return {
        authorization: {
          oauth: $.extend({
            code: this.code
          }, authorization)
        }
      };
    };

    TraktPinAuthentication.prototype.update = function(data) {
      this.changed = false;
      this.original = angular.copy(data);

      // Authorization details
      this.authorization = null;
      this.code = data.code;

      // State
      this.messages = [];
      this.state = data.state;
    };

    TraktPinAuthentication.prototype.updateAuthorization = function(authorization) {
      this.authorization = authorization;
      this.changed = true;
    };

    return TraktPinAuthentication;
  });
