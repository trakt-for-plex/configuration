'use strict';

angular.module('configurationApp')
  .factory('PAPI', function(Authentication, PHeaders, $http) {
    var baseUrl = 'https://plex.tv/';

    return {
      resources: function(includeHttps) {
        return $http({
          method: 'GET',
          url: 'https://plex.tv/api/resources',
          params: {
            includeHttps: includeHttps ? 1 : 0
          },
          headers: $.extend(PHeaders.get(), {
            'X-Plex-Token': Authentication.token()
          })
        });
      }
    };
  });
