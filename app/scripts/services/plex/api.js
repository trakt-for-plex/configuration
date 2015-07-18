'use strict';

angular.module('configurationApp')
  .factory('PAPI', function(Authentication, PHeaders, $http, $q) {
    var baseUrl = 'https://plex.tv/';

    return {
      resources: function(includeHttps) {
        var token = Authentication.token();

        if(typeof token === 'undefined' || token === null) {
          return $q.reject();
        }

        var deferred = $q.defer();

        // Build request
        var request = $http({
          method: 'GET',
          url: 'https://plex.tv/api/resources',
          params: {
            includeHttps: includeHttps ? 1 : 0
          },
          headers: $.extend(PHeaders.get(), {
            'X-Plex-Token': token
          })
        });

        // Handle response
        request
          .success(function(data) {
            deferred.resolve(data);
          })
          .error(function() {
            deferred.reject();
          });

        return deferred.promise;
      }
    };
  });
