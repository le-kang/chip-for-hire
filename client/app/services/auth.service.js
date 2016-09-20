(function() {
  'use strict';

  angular
    .module('chipForHire')
    .factory('auth', auth);

  /** @ngInject */
  function auth(Admin, Shopkeeper, $rootScope, _){
    function login(role, email, password, rememberMe) {
      var User = role == 'Admin' ? Admin: Shopkeeper;
      return User
        .login({
          rememberMe: rememberMe
        },{
          email: email,
          password: password
        })
        .$promise
        .then(function(response) {
          $rootScope.currentUser = _.extend(response.user, { role: role });
          var storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
        });
    }

    function logout(role) {
      var User = role == 'Admin' ? Admin: Shopkeeper;
      return User
        .logout()
        .$promise
        .then(function() {
          localStorage.clear();
          sessionStorage.clear();
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
      register: register
    };
  }

})();
