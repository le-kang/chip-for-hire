(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('LoginController', LoginController);

  /** ngInject */
  function LoginController(auth, $state, $mdDialog) {
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
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(false)
              .title('Login failed')
              .textContent('Invalid email or password, please retry.')
              .ok('Got it!')
          );
        });
    }
  }

})();
