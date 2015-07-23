'use strict';

angular.module('configurationApp')
  .factory('AccountAuthentication', function(BaseAuthentication, PlexAuthentication, TraktAuthentication) {
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

      this.state = BaseAuthentication.selectPriorityState([
        this.plex.state,
        this.trakt.state
      ], 'bottom');
    };

    return AccountAuthentication;
  });
