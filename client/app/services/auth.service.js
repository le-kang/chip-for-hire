(function() {
  'use strict';

  angular
    .module('chipForHire')
    .factory('auth', auth);

  /** @ngInject */
  function auth(Admin, Shopkeeper, $rootScope, _){
    function login(email, password) {
      return Shopkeeper
        .login({email: email, password: password})
        .$promise
        .then(function(response) {
          $rootScope.currentUser = _.extend(response.user, { role: 'Shopkeeper' });
          sessionStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
        });
    }

    function logout() {
      return Shopkeeper
        .logout()
        .$promise
        .then(function() {
          $rootScope.currentUser = null;
          sessionStorage.removeItem('currentUser');
        });
    }

    function loginAsAdmin(email, password) {
      return Admin
        .login({email: email, password: password})
        .$promise
        .then(function(response) {
          $rootScope.currentUser = _.extend(response.user, { role: 'Admin' });
          sessionStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
        });
    }

    function logoutAsAdmin() {
      return Admin
        .logout()
        .$promise
        .then(function() {
          sessionStorage.removeItem('currentUser');
        });
    }

    function register(name, email, password) {
      return Shopkeeper
        .create({
          name: name,
          email: email,
          password: password
        })
        .$promise;
    }

    return {
      login: login,
      logout: logout,
      loginAsAdmin: loginAsAdmin,
      logoutAsAdmin: logoutAsAdmin,
      register: register
    };
  }

})();
