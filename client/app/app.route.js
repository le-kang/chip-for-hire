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
          banner: {
            templateUrl: 'app/views/banner.html'
          },
          content: {
            template: '<div ui-view class="container" layout="row" layout-xs="column" layout-margin></div>'
          },
          menu: {
            templateUrl: 'app/views/menu.html'
          }
        }
      })
      .state('main.view.home', {
        url: '/',
        templateUrl: 'app/views/home.html',
        requireAuthentication: true,
        controller: 'HomeController',
        controllerAs: 'home'
      })

      .state('main.view.profile', {
        url: '/profile',
        templateUrl: 'app/views/profile.html',
        requireAuthentication: true,
        controller: 'ProfileController',
        controllerAs: 'profile'
      })
      .state('main.view.activities', {
        url: '/activities',
        templateUrl: 'app/views/activities.html',
        requireAuthentication: true,
        controller: 'ActivitiesController',
        controllerAs: 'activities'
      })
      .state('main.view.products', {
        url: '/products',
        templateUrl: 'app/views/products.html',
        requireAuthentication: true,
        controller: 'ProductsController',
        controllerAs: 'products'
      })
      .state('main.view.surveys', {
        url: '/surveys',
        templateUrl: 'app/views/surveys.html',
        requireAuthentication: true,
        controller: 'SurveysController',
        controllerAs: 'surveys'
      })
      .state('admin-login', {
        url: '/admin-login',
        templateUrl: 'app/views/admin-login.html',
        controller: 'AdminLoginController',
        controllerAs: 'login'
      })
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/views/admin.html',
        requireAuthentication: true,
        requireAdmin: true,
        controller: 'AdminController',
        controllerAs: 'admin'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
