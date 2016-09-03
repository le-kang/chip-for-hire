(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('LoginController', LoginController);

  /** ngInject */
  function LoginController(auth, $state, $mdToast) {
    var vm = this;
    vm.action = 'sign-in';
    vm.name = '';
    vm.email = '';
    vm.password = '';
    vm.toggleRegistration = toggleRegistration;
    vm.login = login;
    vm.register = register;

    function toggleRegistration() {
      vm.action = (vm.action == 'sign-in' ? 'sign-up' : 'sign-in');
      vm.name = '';
      vm.email = '';
      vm.password = '';
    }

    function login() {
      auth
        .login(vm.email, vm.password)
        .then(function() {
          $state.go('main.view.home');
        }, function() {

        });
    }

    function register() {
      auth
        .register(vm.name, vm.email, vm.password)
        .then(function() {
          $mdToast.show(
            $mdToast
              .simple()
              .textContent('Account "' + vm.email + '" created')
              .hideDelay(3000)
          );
          login();
        }, function() {

        });
    }
  }

})();
