'use strict';

angular.module('configurationApp')
  .factory('Utils', function () {
    return {
      isDefined: function(value) {
        return !!(typeof value !== 'undefined' && value !== null);
      }
    };
  });
