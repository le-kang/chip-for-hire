(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('LoginController', LoginController);

  /** ngInject */
  function LoginController(auth, $state) {
    var vm = this;
    vm.name = '';
    vm.email = '';
    vm.password = '';
    vm.rememberMe = false;
    vm.login = login;

    function login(role) {
      auth.login(role, vm.email, vm.password, vm.rememberMe)
        .then(function() {
          $state.go(role == 'Admin' ? 'admin' : 'main.view.home');
        }, function() {

        });
    }
  }

})();
