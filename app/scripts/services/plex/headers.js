'use strict';

angular.module('configurationApp')
  .factory('PlexHeaders', function() {
    var parser = new UAParser(),
        result = parser.getResult();

    // Generate client identifier
    if(localStorage['plex.client.identifier'] == null) {
      localStorage['plex.client.identifier'] = Math.random().toString(36).substr(2);
    }

    // Build headers
    var headers = {
      'X-Plex-Client-Identifier': localStorage['plex.client.identifier'],

      'X-Plex-Device':            result.os.name,
      'X-Plex-Device-Name':       'trakt (for Plex) - Configuration (' + result.browser.name + ')',

      'X-Plex-Platform':          result.browser.name,
      'X-Plex-Platform-Version':  result.browser.version.split('.').slice(0, 2).join('.'),

      'X-Plex-Product':           'trakt (for Plex)',
      'X-Plex-Version':           '1.0.0'
    };

    return {
      get: function() {
        return headers;
      }
    };
  });
