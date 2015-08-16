'use strict';

angular.module('configurationApp')
  .directive('coPlexHome', function(Authentication) {
    function PlexHome($scope) {
      this.$scope = $scope;

      // Bind scope functions
      var self = this;

      $scope.select = function(user) {
        self.select(user);
      };
    }

    PlexHome.prototype.refresh = function() {
      var $scope = this.$scope;

      plex.cloud['/api/home'].users().then(function(data) {
        var users = data.MediaContainer.User;

        if(typeof users.length === 'undefined') {
          users = [users];
        }

        $scope.$apply(function() {
          $scope.users = users;
        });

        console.log($scope.users);
      }, function() {
        $scope.$apply(function() {
          $scope.users = [];
        });
      });
    };

    PlexHome.prototype.select = function(user) {
      console.log('select', user);

      if(user._protected === '1') {
        this.pinLogin(user);
      } else {
        this.basicLogin(user);
      }
    };

    PlexHome.prototype.basicLogin = function(user, pin) {
      var $scope = this.$scope;

      // Fire callback
      $scope.onAuthenticated(user._id, pin);
    };

    PlexHome.prototype.pinLogin = function(user) {
      // TODO display pin input dialog
    };

    return {
      restrict: 'E',
      scope: {
        onAuthenticated: '=coAuthenticated'
      },
      templateUrl: 'directives/plex/home.html',

      controller: function($scope) {
        // Set initial scope values
        $scope.users = [];

        // Construct main controller
        var main = new PlexHome($scope);

        // Initial account refresh
        main.refresh();
      },

      link: function(scope, element, attrs) {
      }
    };
  });
