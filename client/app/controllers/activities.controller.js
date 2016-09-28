(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('ActivitiesController', ActivitiesController);

  /** @ngInject */
  function ActivitiesController($rootScope, $scope, Shopkeeper, _, moment, $mdMedia) {
    var vm = this;
    vm.list = [];
    vm.ongoings = [];
    vm.upcomings = [];
    vm.archives = [];
    vm.fetching = true;
    vm.selected = null;
    vm.smallScreen = $mdMedia('xs');

    Shopkeeper
      .findById({
        id: $rootScope.currentUser.id,
        filter: {
          include: [
            {

              relation: 'activities',
              scope: {
                include: ['timeSlot', 'product']
              }
            },
            { relation: 'products' },
            { relation: 'surveys' }
          ]
        }
      })
      .$promise
      .then(function(shopkeeper) {
        _.forEach(shopkeeper.activities, function(activity) {
          activity.timeSlot.date = moment(activity.timeSlot.date);
        });
        vm.list = _.sortBy(shopkeeper.activities, ['timeSlot.date', 'timeSlot.hour']);
        vm.products = shopkeeper.products;
        vm.surveys = shopkeeper.surveys;
        groupActivities();
        vm.fetching = false;
      }, function() {
        vm.fetching = false;
      });

    $scope.$on('regroup-activit', groupActivities);

    function groupActivities() {
      vm.ongoings = _.filter(vm.list, function(activity) {
        return activity.started && !activity.ended;
      });
      vm.upcomings = _.filter(vm.list, function(activity) {
        return !activity.started;
      });
      vm.archives = _.filter(vm.list,  function(activity) {
        return activity.ended;
      });
    }
  }

})();
