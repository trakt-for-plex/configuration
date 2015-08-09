'use strict';

angular.module('configurationApp')
  .factory('TraktAuthentication', function(TraktBasicAuthentication, TraktPinAuthentication, BaseAuthentication, Utils) {
    function TraktAuthentication() {
      this.original = null;

      // Account details
      this.id = null;
      this.username = null;
      this.thumb_url = null;

      this.basic = new TraktBasicAuthentication(this);
      this.pin = new TraktPinAuthentication(this);

      // State
      this.errors = [];
      this.warnings = [];

      this.state = '';
    }

    TraktAuthentication.prototype.check = function() {
      this.state = BaseAuthentication.selectPriorityState([
        this.basic.state,
        this.pin.state
      ]);
    };

    TraktAuthentication.prototype.current = function() {
      var data = {
        trakt: { authorization: {} }
      };

      // Basic
      if(this.basic.changed) {
        $.extend(true, data.trakt.authorization, this.basic.current());
      }

      // PIN
      if(this.pin.changed) {
        $.extend(true, data.trakt.authorization, this.pin.current());
      }

      return data;
    };

    TraktAuthentication.prototype.update = function(data) {
      this.original = angular.copy(data);

      // Account details
      this.id = data.id;
      this.username = data.username;
      this.thumb_url = data.thumb_url;

      this.basic.update(data.authorization.basic);
      this.pin.update(data.authorization.oauth);

      // State
      this.errors = [];
      this.warnings = [];

      this.state = '';
    };

    TraktAuthentication.prototype.updateDetails = function(settings) {
      if(!Utils.isDefined(settings) || !Utils.isDefined(settings.user)) {
        this.username = 'Unknown';
        this.thumb_url = null;

        // TODO Add message to indicate a save is required (for basic authorization)
        return;
      }

      var avatar = settings.user.images.avatar,
          user = settings.user;

      this.username = user.username;
      this.thumb_url = avatar.full;
    };

    return TraktAuthentication;
  });
