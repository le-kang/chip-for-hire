(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ProfileController', ProfileController);

  /** @ngInject */
  function ProfileController($rootScope, $scope, Shopkeeper, Upload, $mdToast) {
    var vm = this;
    vm.currentUser = $rootScope.currentUser;
    vm.newLogo = null;
    vm.save = save;

    $scope.$watch(function() {
      return vm.newLogo;
    }, function() {
      if (vm.newLogo != null) {
        upload(vm.newLogo);
      }
    });

    function save() {
      Shopkeeper
        .prototype$updateAttributes(
          { id: vm.currentUser.id },
          {
            name: vm.currentUser.name,
            description: vm.currentUser.description,
            mobileNumber: vm.currentUser.mobileNumber
          }
        )
        .$promise
        .then(function(res) {
          vm.currentUser = res;
          sessionStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Shop profile updated")
              .hideDelay(3000)
          )
        });
    }

    function upload(logo) {
      Upload.upload({
        url: '/api/Shopkeepers/uploadLogo?id=' + vm.currentUser.id,
        data: {
          id: vm.currentUser.id,
          file: logo
        }
      }).then(function(res) {
        vm.currentUser.logo = res.data.logo;
        sessionStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
      })
    }
  }

})();
