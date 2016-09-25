(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ActivityController', ActivityController);

  /** ngInject */
  function ActivityController($rootScope, $scope, Shopkeeper, $http, $state, $stateParams, _, $timeout, $mdToast) {
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
          if (!vm.selected.started) {
            vm.products = $scope.$parent.activities.products;
            vm.surveys = $scope.$parent.activities.surveys;
          } else if (!vm.selected.ended) {
            vm.streamToken = null;
            prepareStream();
          } else {

          }
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

    function prepareStream() {
      $http
        .get('/stream-token?activityId=' + vm.selected.id)
        .then(function(response) {
          vm.streamToken = response.data.streamToken
        });
    }
  }

})();
