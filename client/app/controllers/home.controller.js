(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('HomeController', HomeController);

  /** @ngInject */
  function HomeController($rootScope, TimeSlot, Shopkeeper, News, _, moment, $mdDialog) {
    var vm = this;
    vm.moment = moment;
    vm.viewNews = viewNews;

    TimeSlot
      .find({
        filter: {
          where: {
            date: { gte: moment().startOf('day').valueOf() }
          },
          include: ['activity']
        }
      })
      .$promise
      .then(function(timeSlots) {
        vm.timeSlots = _.filter(timeSlots, function(timeSlot) {
          return !timeSlot.activity;
        });
      });

    Shopkeeper
      .findById({
        id: $rootScope.currentUser.id,
        filter: {
          include: [
            {
              relation: 'activities',
              scope: {
                where: {
                  started: false
                },
                include: ['timeSlot']
              }
            },
            { relation: 'products' },
            { relation: 'surveys' }
          ]
        }
      })
      .$promise
      .then(function(shopkeeper) {
        vm.activities = shopkeeper.activities;
        vm.products = shopkeeper.products;
        vm.surveys = shopkeeper.surveys;
      });

    News
      .find({
        filter: {
          order: 'createdAt DESC'
        }
      })
      .$promise
      .then(function(newsList) {
        vm.newsList = newsList;
      });

    function viewNews(news) {
      $mdDialog
        .show(
          $mdDialog
            .alert()
            .title(news.title)
            .textContent(news.content)
            .ok('Close')
        );
    }
  }

})();
