(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ProductController', ProductController);

  /** ngInject */
  function ProductController($scope, $state, $stateParams, _, $timeout, Product, Upload, $mdToast) {
    var vm = this;
    vm.selected = null;
    vm.images = [];
    vm.currentImageIndex = 0;
    vm.toggleImage = toggleImage;
    vm.deleteImage = deleteImage;
    vm.save = save;
    vm.unselect = unselect;

    getSelected();

    $scope.$watch(function() {
      return vm.images;
    }, function() {
      if (vm.images.length > 0) {
        uploadImages(vm.images);
      }
    });

    function getSelected() {
      if ($scope.$parent.products.fetching) {
        $timeout(getSelected, 100)
      } else {
        vm.selected = _.find($scope.$parent.products.list, {'id': $stateParams.id});
        if (!vm.selected) {
          $state.go('main.view.products');
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Product not found")
              .hideDelay(3000)
          )
        } else {
          $scope.$parent.products.selected = vm.selected;
        }
      }
    }

    function toggleImage(offset) {
      vm.currentImageIndex += offset;
      if (vm.currentImageIndex < 0) {
        vm.currentImageIndex = vm.selected.images.length - 1;
      } else if (vm.currentImageIndex == vm.selected.images.length) {
        vm.currentImageIndex = 0;
      }
    }

    function uploadImages(images) {
      Upload.upload({
        url: '/api/Products/uploadImages?id=' + vm.selected.id,
        data: {
          id: vm.selected.id,
          file: images
        }
      }).then(function(res) {
        vm.images = [];
        vm.selected.images = res.data.images;
      })
    }

    function deleteImage() {
      Product
        .deleteImage({
          id: vm.selected.id,
          image: vm.selected.images[vm.currentImageIndex]
        })
        .$promise
        .then(function(res) {
          vm.selected.images = res.images;
          if (vm.currentImageIndex >= vm.selected.images.length) {
            vm.currentImageIndex = vm.selected.images.length - 1;
          }
        });
    }

    function save() {
      Product
        .patchAttributes(
          { id: vm.selected.id },
          {
            name: vm.selected.name,
            description: vm.selected.description
          }
        )
        .$promise
        .then(function(product) {
          vm.selected = product;
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Product updated")
              .hideDelay(3000)
          )
        });
    }

    function unselect() {
      vm.selected = null;
      $scope.$parent.products.selected = null;
      $state.go('main.view.products');
    }
  }

})();
