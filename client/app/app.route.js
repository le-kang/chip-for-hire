(function() {
  'use strict';

  angular
    .module('chipForHire')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/views/login.html',
        controller: 'LoginController',
        controllerAs: 'login'
      })
      .state('main', {
        abstract: true,
        templateUrl: 'app/views/main.html'
      })
      .state('main.view', {
        abstract: true,
        views: {
          header: {
            templateUrl: 'app/views/header.html'
          },
          content: {
            template: '<div class="container" ui-view layout="row"></div>'
          }
        }
      })
      .state('main.view.home', {
        url: '/',
        templateUrl: 'app/views/home.html',
        requireAuthentication: true
        // controller: 'HomeController',
        // controllerAs: 'home'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
