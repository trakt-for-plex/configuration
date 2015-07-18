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
    'ngRaven',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',

    'angulartics',
    'angulartics.google.analytics',

    'mm.foundation',
    'selectize',
    'xml'
  ])
  .config(function ($httpProvider, $ravenProvider, $routeProvider) {
    // Setup angular-raven
    // $ravenProvider.development(true);

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
      .when('/logout', {
        templateUrl: 'views/logout.html',
        controller: 'LogoutController'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(Authentication, RavenTags, $location, $rootScope) {
    // Store metadata in root scope
    $rootScope.$m = window.tfpc.metadata;

    // Send version/revision with error reports
    var $m = window.tfpc.metadata;

    RavenTags.update({
      application_version: $m.version,
      application_revision: $m.revision.label
    });

    // Redirect handler
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
        next.resolve = angular.extend(next.resolve || {}, {
          __authenticate__: function() {
            Authentication.get().then(function() {
              console.log('authenticated');
            }, function() {
              $rootScope.$r.path = $location.path();
              $rootScope.$r.search = $location.search();

              $location.path('/login');
              $location.search('');
            });
          }
        });
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
