(function() {
  'use strict';

  angular
    .module('chipForHire')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('authentication', {
        abstract: true,
        templateUrl: 'app/views/authentication.html'
      })
      .state('authentication.shopkeeper-login', {
        url: '/login',
        templateUrl: 'app/views/login.html',
        controller: 'LoginController',
        controllerAs: 'login'
      })
      .state('authentication.admin-login', {
        url: '/admin-login',
        templateUrl: 'app/views/admin-login.html',
        controller: 'LoginController',
        controllerAs: 'login'
      })
      .state('authentication.register', {
        url: '/register',
        templateUrl: 'app/views/register.html',
        controller: 'RegisterController',
        controllerAs: 'register'
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
        controller: 'HomeController',
        controllerAs: 'home',
        access: 'Shopkeeper'
      })

      .state('main.view.profile', {
        url: '/profile',
        templateUrl: 'app/views/profile.html',
        controller: 'ProfileController',
        controllerAs: 'profile',
        access: 'Shopkeeper'
      })
      .state('main.view.activities', {
        url: '/activities',
        templateUrl: 'app/views/activities.html',
        controller: 'ActivitiesController',
        controllerAs: 'activities',
        access: 'Shopkeeper'
      })
      .state('main.view.activities.selected', {
        url: '/:id',
        templateUrl: 'app/views/activity.html',
        controller: 'ActivityController',
        controllerAs: 'activity',
        access: 'Shopkeeper'
      })
      .state('main.view.products', {
        url: '/products',
        templateUrl: 'app/views/products.html',
        controller: 'ProductsController',
        controllerAs: 'products',
        access: 'Shopkeeper'
      })
      .state('main.view.products.selected', {
        url: '/:id',
        templateUrl: 'app/views/product.html',
        controller: 'ProductController',
        controllerAs: 'product',
        access: 'Shopkeeper'
      })
      .state('main.view.surveys', {
        url: '/surveys',
        templateUrl: 'app/views/surveys.html',
        controller: 'SurveysController',
        controllerAs: 'surveys',
        access: 'Shopkeeper'
      })
      .state('main.view.surveys.selected', {
        url: '/:id',
        templateUrl: 'app/views/survey.html',
        controller: 'SurveyController',
        controllerAs: 'survey',
        access: 'Shopkeeper'
      })
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/views/admin.html',
        requireAuthentication: true,
        requireAdmin: true,
        controller: 'AdminController',
        controllerAs: 'admin',
        access: 'Admin'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
