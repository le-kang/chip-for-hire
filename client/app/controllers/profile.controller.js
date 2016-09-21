(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ProfileController', ProfileController);

  /** @ngInject */
  function ProfileController($rootScope, $scope, Shopkeeper, Upload, $mdToast, _) {
    var vm = this;
    vm.currentUser = _.clone($rootScope.currentUser);
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
        .patchAttributes(
          { id: vm.currentUser.id },
          {
            name: vm.currentUser.name,
            description: vm.currentUser.description,
            mobileNumber: vm.currentUser.mobileNumber
          }
        )
        .$promise
        .then(function() {
          updateCache();
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
        updateCache();
      })
    }

    function updateCache() {
      $rootScope.currentUser = _.clone(vm.currentUser);
      if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify($rootScope.currentUser));
      }
    }
  }

})();
