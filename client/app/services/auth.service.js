(function() {
  'use strict';

  angular
    .module('chipForHire')
    .factory('auth', auth);

  /** @ngInject */
  function auth(Admin, Shopkeeper, $rootScope){
    function login(email, password) {
      return Shopkeeper
        .login({email: email, password: password})
        .$promise
        .then(function(response) {
          var currentUser = {
            id: response.user.id,
            name: response.user.name,
            role: 'Shopkeeper'
          };
          $rootScope.currentUser = currentUser;
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
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
          var currentUser = {
            id: response.user.id,
            name: response.user.name,
            role: 'Admin'
          };
          $rootScope.currentUser = currentUser;
          sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
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
