(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('RegisterController', RegisterController);

  /** ngInject */
  function RegisterController(auth, $state, $mdToast, $mdDialog) {
    var vm = this;
    vm.name = '';
    vm.email = '';
    vm.password = '';
    vm.register = register;

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
          auth.login('Shopkeeper', vm.email, vm.password, false)
            .then(function() {
              $state.go('main.view.home');
            });
        }, function() {
          $mdDialog.show(
            $mdDialog.alert()
              .clickOutsideToClose(false)
              .title('Registration failed')
              .textContent('Account "' + vm.email + '" is already existed.')
              .ok('Got it!')
          );
        });
    }
  }

})();
