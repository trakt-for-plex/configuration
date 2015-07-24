'use strict';

angular.module('configurationApp')
  .factory('StringUtil', function() {
    return {
      endsWith: function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
      }
    };
  });
