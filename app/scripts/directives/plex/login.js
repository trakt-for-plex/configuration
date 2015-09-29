'use strict';

angular.module('configurationApp')
  .directive('coPlexLogin', function(Utils, $q) {
    function PlexLogin($scope) {
      this.$scope = $scope;

      // Bind functions
      var self = this;

      $scope.$on('reset', function() {
        self.reset();
      });

      $scope.basicLogin = function() {
        return self.basicLogin($scope.credentials);
      };

      $scope.onHomeAuthenticated = function(id, pin) {
        self.onHomeAuthenticated(id, pin);
      };

      $scope.onPinAuthenticated = function(credentials) {
        self.onPinAuthenticated(credentials);
      };

      $scope.onPinExpired = function() {
        self.onPinExpired();
      };

      $scope.switch = function(method) {
        $scope.messages = [];
        $scope.method = method;
      };
    }

    PlexLogin.prototype.reset = function() {
      var $scope = this.$scope;

      // Reset scope values
      $scope.credentials = {
        username: null,
        password: null
      };

      $scope.messages = [];
      $scope.method = 'pin';
    };

    PlexLogin.prototype.appendMessage = function(type, content) {
      var $scope = this.$scope;

      $scope.messages.push({
        type: type,
        content: content
      });
    };

    PlexLogin.prototype.basicLogin = function(credentials) {
      var $scope = this.$scope,
          self = this;

      // Reset errors
      $scope.messages = [];

      if(!Utils.isDefined(credentials) ||
         !Utils.isDefined(credentials.username) ||
         !Utils.isDefined(credentials.password)) {
        self.appendMessage('error', 'Invalid basic login request');
        return $q.reject();
      }

      // Perform login
      return plex.cloud['/users'].login(
        credentials.username,
        credentials.password
      ).then(
        function(response) {
          $scope.$apply(function() {
            self.handleSuccess(response.data.user);
          });
        },
        function(response) {
          $scope.$apply(function() {
            self.handleError(response.data, response.statusCode);
          });

          return $q.reject();
        }
      );
    };

    PlexLogin.prototype.onHomeAuthenticated = function(id, pin) {
      var $scope = this.$scope,
          self = this;

      // Reset errors
      $scope.messages = [];

      if(!Utils.isDefined(id)) {
        self.appendMessage('error', 'Invalid user switch request');
        return;
      }

      if(Utils.isDefined(pin) && isNaN(pin)) {
        self.appendMessage('error', 'PIN contains invalid characters, only numbers are allowed');
        return;
      }

      // Retrieve account details
      plex.cloud['/api/home/users'].switch(id, pin).then(function(response) {
        $scope.$apply(function() {
          self.handleSuccess(response.data.user);
        });
      }, function(response) {
        $scope.$apply(function() {
          self.handleError(response.data, response.statusCode);
        });
      });
    };

    PlexLogin.prototype.onPinAuthenticated = function(credentials) {
      var $scope = this.$scope,
          self = this;

      // Reset errors
      $scope.messages = [];

      if(!Utils.isDefined(credentials) ||
         !Utils.isDefined(credentials.token)) {
        self.appendMessage('error', 'Invalid pin login request');
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
        function(response) {
          $scope.$apply(function() {
            self.handleSuccess(response.data.user);
          });
        },
        function(response) {
          $scope.$apply(function() {
            self.handleError(response.data, response.statusCode);
          });
        }
      );
    };

    PlexLogin.prototype.onPinExpired = function() {
      var $scope = this.$scope;

      this.appendMessage('error', 'Pin has expired');
    };

    PlexLogin.prototype.handleSuccess = function(user) {
      var $scope = this.$scope;

      // Pass to callback
      $scope.onAuthenticated(user._authenticationToken, user);
    };

    PlexLogin.prototype.handleError = function(data, status) {
      var $scope = this.$scope;

      // Login failed
      if(
        Utils.isDefined(data) &&
        Utils.isDefined(data.errors) &&
        Utils.isDefined(data.errors.error)
      ) {
        // "Error" elements found
        var errors = typeof data.errors.error === 'object' ? data.errors.error : [data.errors.error];

        for (var i = 0; i < errors.length; ++i) {
          this.appendMessage('error', errors[i]);
        }
      } else if(
        Utils.isDefined(data.Response) &&
        Utils.isDefined(data.Response._status)
      ) {
        // "Response" element found (home user switch)
        this.appendMessage('error', data.Response._status);
      } else {
        // Display HTTP error
        this.appendMessage('error', 'HTTP Error: ' + status);
      }
    };

    return {
      restrict: 'E',
      scope: {
        onAuthenticated: '=coAuthenticated',

        isCancelEnabled: '=coCancelEnabled',
        onCancelled: '=coCancelled',

        buttonSize: '@coButtonSize',
        modes: '=coModes'
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

        $scope.messages = [];
        $scope.method = 'pin';

        // Construct main controller
        var main = new PlexLogin($scope);
      }
    };
  });
