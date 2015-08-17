'use strict';

angular.module('configurationApp')
  .directive('coPlexHome', function(Authentication) {
    function PlexHome($scope) {
      this.$scope = $scope;

      // Bind scope functions
      var self = this;

      $scope.$on('reset', function() {
        self.reset();
      });

      $scope.pinKeyUp = function($event) {
        self.pinKeyUp($event);
      };

      $scope.select = function(user) {
        self.select(user);
      };

      $scope.switch = function(state) {
        $scope.state = state;
      };
    }

    PlexHome.prototype.reset = function() {
      var $scope = this.$scope;

      // Reset scope values
      $scope.current = null;
      $scope.state = 'list';

      $scope.users = [];
    };

    PlexHome.prototype.refresh = function() {
      var $scope = this.$scope;

      plex.cloud['/api/home'].users().then(function(response) {
        var data = response.data,
            users = data.MediaContainer.User;

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
      var $scope = this.$scope;

      // Switch to PIN input state
      $scope.current = user;
      $scope.state = 'pin';
    };

    PlexHome.prototype.pinKeyUp = function($event) {
      var $scope = this.$scope,
          $input = $($event.target),
          $cell = $input.parent('span'),
          $container = $cell.parent('div');

      // Prevent default character insertion
      $event.preventDefault();

      // Handle key
      if($event.keyCode === 8) {
        if($input.val() !== '') {
          // Clear current field
          $input.val('');
          return;
        }

        // Find previous field
        var $prev = $cell.prev();

        if($prev.length === 0) {
          return;
        }

        // Clear previous field
        $('input', $prev)
          .val('')
          .focus();
      } else {
        // Set character
        $input.val(String.fromCharCode($event.keyCode));

        // Move to next field
        var $next = $cell.next();

        if($next.length === 0) {
          // Done
          var $fields = $('input', $container),
              pin = '';

          // Build pin from fields
          for(var i = 0; i < $fields.length; ++i) {
            var val = $($fields[i]).val();

            if(val === '') {
              return;
            }

            pin += val;
          }

          // Fire callback
          $scope.onAuthenticated($scope.current._id, pin);
          return;
        }

        $('input', $next)
          .focus();
      }
    };

    return {
      restrict: 'E',
      scope: {
        onAuthenticated: '=coAuthenticated'
      },
      templateUrl: 'directives/plex/home.html',

      controller: function($scope) {
        // Set initial scope values
        $scope.current = null;
        $scope.state = 'list';

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
