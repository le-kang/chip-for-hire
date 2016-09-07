(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ActivityController', ActivityController);

  /** ngInject */
  function ActivityController($rootScope, $scope, Shopkeeper, $state, $stateParams, _, $timeout, $mdToast) {
    var vm = this;
    vm.selected = null;
    vm.save = save;
    vm.unselect = unselect;

    getSelected();

    function getSelected() {
      if ($scope.$parent.activities.fetching) {
        $timeout(getSelected, 100)
      } else {
        vm.selected = _.find($scope.$parent.activities.list, { id: $stateParams.id });
        if (!vm.selected) {
          $state.go('main.view.activities');
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Activity not found")
              .hideDelay(3000)
          )
        } else {
          $scope.$parent.activities.selected = vm.selected;
          vm.products = $scope.$parent.activities.products;
          vm.surveys = $scope.$parent.activities.surveys;
        }
      }
    }

    function save() {
      Shopkeeper
        .activities
        .updateById(
          {
            id: $rootScope.currentUser.id,
            fk: vm.selected.id
          },
          {
            productId: vm.selected.productId,
            surveyId: vm.selected.surveyId
          }
        )
        .$promise
        .then(function(activity) {
          vm.selected = activity;
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Activity updated")
              .hideDelay(3000)
          )
        })
    }

    function unselect() {
      vm.selected = null;
      $scope.$parent.activities.selected = null;
      $state.go('main.view.activities');
    }
  }

})();
