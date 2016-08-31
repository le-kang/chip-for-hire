(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ProductsController', ProductsController);

  /** ngInject */
  function ProductsController($rootScope, $scope, Product, Upload, $mdDialog, $mdToast, $mdMedia) {
    var vm = this;
    vm.list = [];
    vm.selected = null;
    vm.images = [];
    vm.currentImageIndex = 0;
    vm.smallScreen = $mdMedia('xs');

    vm.add = add;
    vm.select = select;
    vm.unselect = unselect;
    vm.toggleImage = toggleImage;
    vm.deleteImage = deleteImage;
    vm.save = save;

    $scope.$watch(function() {
      return vm.images;
    }, function() {
      if (vm.images.length > 0) {
        uploadImages(vm.images);
      }
    });

    Product
      .find({
        filter: {
          where: {
            shopkeeperId: $rootScope.currentUser.id
          }
        }
      })
      .$promise
      .then(function(products) {
        vm.list = products;
      });

    function add($event) {
      var dialog = $mdDialog.prompt()
        .title('What would you name your product?')
        .placeholder('Product name')
        .ariaLabel('Product name')
        .targetEvent($event)
        .ok('Add')
        .cancel('Cancel');
      $mdDialog.show(dialog).then(function(name) {
        Product
          .create({
            name: name,
            shopkeeperId: $rootScope.currentUser.id
          })
          .$promise
          .then(function(product) {
            vm.list.push(product);
          })
      }, function() {

      });
    }

    function select(product) {
      vm.selected = product;
      vm.currentImageIndex = 0;
    }

    function unselect() {
      vm.selected = null;
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
  }

})();
