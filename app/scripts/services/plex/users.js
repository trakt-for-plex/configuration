'use strict';

angular.module('configurationApp')
  .factory('PUsers', function(PHeaders, $http, $q) {
    return {
      sign_in: function(credentials) {
        var deferred = $q.defer();

        if(credentials == null || credentials.username == null || credentials.password == null) {
          deferred.reject();
          return deferred.promise;
        }

        // Send request
        return $http({
          method: 'POST',
          url: 'https://plex.tv/users/sign_in.xml',
          headers: $.extend(PHeaders.get(), {
            'Authorization': 'Basic ' + btoa(credentials.username + ':' + credentials.password)
          })
        });
      },
      account: function(token) {
        return $http({
          method: 'GET',
          url: 'https://plex.tv/users/account',
          headers: $.extend(PHeaders.get(), {
            'X-Plex-Token': token
          })
        });
      }
    };
  });
