'use strict';

angular.module('configurationApp')
  .factory('RavenTags', function() {
    var tags = {};

    return {
      update: function(update) {
        _.each(update, function(value, key) {
          tags[key] = value;
        });

        Raven.setTagsContext(tags);
      }
    }
  });
