'use strict';

/**
 * @ngdoc overview
 * @name configurationApp
 * @description
 * # configurationApp
 *
 * Main module of the application.
 */
angular
  .module('configurationApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',

    'mm.foundation',
    'xml'
  ])
  .config(function ($httpProvider, $routeProvider) {
    // Setup angular-xml
    $httpProvider.interceptors.push('xmlHttpInterceptor');

    // Setup routes
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })
      .when('/configuration/server', {
        templateUrl: 'views/configuration/server.html',
        controller: 'ServerController'
      })
      .when('/configuration/accounts', {
        templateUrl: 'views/configuration/accounts.html',
        controller: 'AccountsController',
        reloadOnSearch: false
      })
      .when('/configuration/rules', {
        templateUrl: 'views/configuration/rules.html',
        controller: 'RulesController'
      })
      .when('/connect', {
        templateUrl: 'views/connect.html',
        controller: 'ConnectController'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(Authentication, $location, $rootScope) {
    $rootScope.$a = {
      authenticated: false,
      user: null
    };

    $rootScope.$r = {
      path: null,
      search: null,

      redirect: function() {
        // Update path
        if(this.path !== null) {
          $location.path(this.path);
        } else {
          $location.path('/');
        }

        // Update path
        if(this.search !== null) {
          $location.search(this.search);
        } else {
          $location.search('');
        }
      }
    };

    $rootScope.$on('$routeChangeStart', function(event, next) {
      var controller = next.controller;

      if(controller === 'LoginController') {
        return;
      }

      if(!Authentication.authenticated()) {
        $rootScope.$a.authenticated = false;

        next.resolve = angular.extend(next.resolve || {}, {
          __authenticate__: function() {
            Authentication.get().then(function() {
              $rootScope.$a.authenticated = true;
              $rootScope.$a.user = Authentication.user();

              console.log('authenticated');
            }, function() {
              $rootScope.$r.path = $location.path();
              $rootScope.$r.search = $location.search();

              $location.path('/login');
              $location.search('');
            });
          }
        });
      } else {
        $rootScope.$a.authenticated = true;
      }

      if(controller === 'ConnectController') {
        return;
      }

      if($rootScope.$s === null || typeof $rootScope.$s === 'undefined') {
        $rootScope.$r.path = $location.path();
        $rootScope.$r.search = $location.search();

        $location.path('/connect');
        $location.search('');
      }
    });
  });
