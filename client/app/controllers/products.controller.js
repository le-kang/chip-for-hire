(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ProductsController', ProductsController);

  /** ngInject */
  function ProductsController($rootScope, Product, $mdDialog, $mdMedia) {
    var vm = this;
    vm.list = [];
    vm.fetching = true;
    vm.selected = null;
    vm.smallScreen = $mdMedia('xs');
    vm.add = add;

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
        vm.fetching = false;
      }, function() {
        vm.fetching = false;
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
      });
    }
  }

})();
