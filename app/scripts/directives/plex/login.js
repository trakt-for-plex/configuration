'use strict';

angular.module('configurationApp')
  .directive('coPlexLogin', function(Utils) {
    function PlexLogin($scope) {
      this.$scope = $scope;

      // Bind functions
      var self = this;

      $scope.basicLogin = function() {
        self.basicLogin($scope.credentials);
      };

      $scope.onPinAuthenticated = function(credentials) {
        self.onPinAuthenticated(credentials);
      };

      $scope.onPinExpired = function() {
        self.onPinExpired();
      };

      $scope.switch = function(method) {
        $scope.errors = [];
        $scope.method = method;
      };
    }

    PlexLogin.prototype.basicLogin = function(credentials) {
      var $scope = this.$scope,
          self = this;

      // Reset errors
      $scope.errors = [];

      if(!Utils.isDefined(credentials) ||
         !Utils.isDefined(credentials.username) ||
         !Utils.isDefined(credentials.password)) {
        $scope.errors.push('Invalid basic login request');
        return;
      }

      // Perform login
      plex.cloud['/users'].login(
        credentials.username,
        credentials.password
      ).then(
        function(data) {
          $scope.$apply(function() {
            self.handleSuccess(data.user);
          });
        },
        function(data, status) {
          $scope.$apply(function() {
            self.handleError(data, status);
          });
        }
      );
    };

    PlexLogin.prototype.onPinAuthenticated = function(credentials) {
      var $scope = this.$scope,
          self = this;

      // Reset errors
      $scope.errors = [];

      if(!Utils.isDefined(credentials) ||
         !Utils.isDefined(credentials.token)) {
        $scope.errors.push('Invalid pin login request');
        return;
      }

      // Retrieve account details
      plex.cloud['/users'].account(
        credentials.token, {
          plex: {
            useToken: false
          }
        }
      ).then(
        function(data) {
          $scope.$apply(function() {
            self.handleSuccess(data.user);
          });
        },
        function(data, status) {
          $scope.$apply(function() {
            self.handleError(data, status);
          });
        }
      );
    };

    PlexLogin.prototype.onPinExpired = function() {
      var $scope = this.$scope;

      $scope.errors.push('Pin has expired');
    };

    PlexLogin.prototype.handleSuccess = function(user) {
      var $scope = this.$scope;

      // Pass to callback
      $scope.onAuthenticated(user._authenticationToken, user);
    };

    PlexLogin.prototype.handleError = function(data, status) {
      var $scope = this.$scope;

      // Login failed
      if(typeof data !== 'undefined' && data !== null) {
        // Display API errors
        $scope.errors = $scope.errors.concat(
          typeof data.errors.error === 'object' ?
            data.errors.error : [data.errors.error]
        );
      } else {
        // Display HTTP error
        $scope.errors.push('HTTP Error: ' + status);
      }
    };

    return {
      restrict: 'E',
      scope: {
        onAuthenticated: '=coAuthenticated',
        onCancelled: '=coCancelled',

        buttonSize: '@coButtonSize'
      },
      templateUrl: 'directives/plex/login.html',

      compile: function(element, attrs) {
        if(typeof attrs.coButtonSize === 'undefined') {
          attrs.coButtonSize = 'small';
        }
      },

      controller: function($scope) {
        // Set initial scope values
        $scope.credentials = {
          username: null,
          password: null
        };

        $scope.errors = [];
        $scope.method = 'pin';

        // Construct main controller
        var main = new PlexLogin($scope);
      }
    };
  });
