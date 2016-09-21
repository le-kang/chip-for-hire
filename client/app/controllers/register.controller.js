(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('RegisterController', RegisterController);

  /** ngInject */
  function RegisterController(auth, $state, $mdToast) {
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
            }, function() {

            });
        }, function() {

        });
    }
  }

})();
