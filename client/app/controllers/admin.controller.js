(function() {
  'use strict';

  angular
    .module('chipForHire')
    .controller('AdminController', AdminController);

  /** @ngInject */
  function AdminController(TimeSlot, Activity, News, moment, _, $mdDialog, $mdToast) {
    var vm = this;
    vm.moment = moment;
    vm.addNews = addNews;
    vm.editNews = editNews;
    vm.deleteNews = deleteNews;

    TimeSlot
      .find({
        filter: {
          where: {
            date: { gte: moment().startOf('day').valueOf() }
          }
        }
      })
      .$promise
      .then(function(timeSlots) {
        vm.timeSlots = timeSlots;
      });

    Activity
      .find({
        filter: {
          where: {
            started: false
          },
          include: ['timeSlot', 'shopkeeper']
        }
      })
      .$promise
      .then(function(activities) {
        vm.activities = activities;
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

    function addNews($event) {
      $mdDialog
        .show({
          templateUrl: 'app/views/edit-news.html',
          controller: newsController,
          controllerAs: 'news',
          targetEvent: $event,
          locals: { news: null }
        })
        .then(function(news) {
          vm.newsList.push(news);
        })
    }

    function editNews(news, $event) {
      $mdDialog
        .show({
          templateUrl: 'app/views/edit-news.html',
          controller: newsController,
          controllerAs: 'news',
          targetEvent: $event,
          locals: { news: news }
        })
        .then(function(updated) {
          var item = _.find(vm.newsList, {id: news.id});
          _.set(item, 'title', updated.title);
          _.set(item, 'content', updated.content);
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("News updated")
              .hideDelay(3000)
          )
        })
    }

    function deleteNews(news, $event) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure to delete this news?')
        .textContent('You cannot retrieve the deleted news back')
        .ariaLabel('Deleting Confirmation')
        .targetEvent($event)
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function() {
        News
          .destroyById({ id: news.id })
          .$promise
          .then(function() {
            _.remove(vm.newsList, function(item) {
              return item.id == news.id;
            });
          });
      });
    }

    function newsController(news) {
      var vm = this;
      vm.id = news ? news.id : null;
      vm.title = news ? news.title : '';
      vm.content = news ? news.content : '';
      vm.submit = submit;
      vm.cancel = cancel;

      function submit() {
        if (!vm.id) {
          News
            .create({
              title: vm.title,
              content: vm.content
            })
            .$promise
            .then(function(news) {
              $mdDialog.hide(news);
            });
        } else {
          News
            .patchAttributes(
              { id: vm.id },
              {
                title: vm.title,
                content: vm.content
              }
            )
            .$promise
            .then(function(news) {
              $mdDialog.hide(news);
            });
        }
      }

      function cancel() {
        $mdDialog.cancel();
      }
    }
  }

})();
