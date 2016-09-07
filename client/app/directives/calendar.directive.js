(function() {
  'use strict';

  angular
    .module('chipForHire')
    .directive('calendar', calendar);

  /** @ngInject */
  function calendar($rootScope, TimeSlot, Shopkeeper, moment, _, $mdDialog, $state) {
    var directive = {
      restrict: 'E',
      scope: {},
      bindToController: {
        timeSlots: '=',
        activities: '=',
        products: '=',
        surveys: '='
      },
      controller: controller,
      controllerAs: 'cal',
      templateUrl: 'app/views/calendar.html'
    };

    return directive;

    function controller() {
      var vm = this;
      vm.role = $rootScope.currentUser.role;
      vm.today = moment().startOf('day');
      vm.currentDate = vm.today;
      vm.startDate = vm.currentDate.clone().startOf('week');
      vm.hours = ['09', '10', '11', '12', '13', '14', '15', '16'];
      vm.isAdmin = isAdmin;
      vm.isCurrentWeek = isCurrentWeek;
      vm.isToday = isToday;
      vm.isBeforeToday = isBeforeToday;
      vm.isCurrentDay = isCurrentDay;
      vm.isWeekend = isWeekend;
      vm.selectDay = selectDay;
      vm.getTimeSlots = getTimeSlots;
      vm.getActivities = getActivities;
      vm.nextWeek = nextWeek;
      vm.previousWeek = previousWeek;
      vm.isAvailable = isAvailable;
      vm.isReserved = isReserved;
      vm.releaseSlot = releaseSlot;
      vm.closeSlot = closeSlot;
      vm.reserve = reserve;
      vm.viewActivity = viewActivity;
      vm.cancelActivity = cancelActivity;
      vm.cancelReservation = cancelReservation;

      getWeek();

      function isAdmin() {
        return vm.role == 'Admin';
      }

      function getWeek() {
        vm.week = [];
        for (var i = 0; i < 7; i++) {
          vm.week.push(vm.startDate.clone().add(i, 'days'));
        }
        return vm.week;
      }

      function isCurrentWeek() {
        return vm.startDate.week() == moment().week() && vm.startDate.year() == moment().year();
      }

      function isToday(day) {
        return day.isSame(vm.today);
      }

      function isBeforeToday(day) {
        return day.isBefore(vm.today);
      }

      function isCurrentDay(day) {
        return day.isSame(vm.currentDate);
      }

      function selectDay(day) {
        if (!isBeforeToday(day)) {
          vm.currentDate = day;
          if (!vm.startDate.isSame(vm.currentDate.clone().startOf('week'))) {
            vm.startDate = vm.currentDate.clone().startOf('week');
            getWeek();
          }
        }
      }

      function isWeekend(day) {
        return day.format('d') == '0' || day.format('d') == '6';
      }

      function getTimeSlots(day) {
        return _.filter(vm.timeSlots, function(timeSlot) {
          return moment(timeSlot.date).isSame(day);
        });
      }

      function getTimeSlot(hour) {
        return _.find(vm.timeSlots, function(timeSlot) {
          return moment(timeSlot.date).isSame(vm.currentDate)
            && timeSlot.hour == hour;
        });
      }

      function getActivities(day) {
        return _.filter(vm.activities, function(activity) {
          return moment(activity.timeSlot.date).isSame(day);
        });
      }

      function getActivity(hour) {
        return _.find(vm.activities, function(activity) {
          return moment(activity.timeSlot.date).isSame(vm.currentDate)
            && activity.timeSlot.hour == hour;
        })
      }

      function nextWeek() {
        vm.startDate.add(7, 'days');
        getWeek();
      }

      function previousWeek() {
        vm.startDate.subtract(7, 'days');
        getWeek();
      }

      function isAvailable(hour) {
        return isAdmin() ? !getTimeSlot(hour) : getTimeSlot(hour);
      }

      function isReserved(hour) {
        return getActivity(hour)
      }

      function releaseSlot(hour) {
        TimeSlot
          .create({
            date: vm.currentDate.valueOf(),
            hour: hour
          })
          .$promise
          .then(function(timeSlot) {
            vm.timeSlots.push(timeSlot)
          })
      }

      function closeSlot(hour, $event) {
        var timeSlot = getTimeSlot(hour);
        var confirm = $mdDialog.confirm()
          .title('Are you sure to close this time slot?')
          .ariaLabel('Deleting Confirmation')
          .targetEvent($event)
          .ok('Yes')
          .cancel('No');
        $mdDialog.show(confirm).then(function() {
          TimeSlot
            .destroyById({ id: timeSlot.id })
            .$promise
            .then(function() {
              vm.timeSlots.splice(vm.timeSlots.indexOf(timeSlot), 1);
            })
        });
      }

      function reserve(hour, $event) {
        var timeSlot = getTimeSlot(hour);
        $mdDialog
          .show({
            templateUrl: 'app/views/reservation.html',
            controller: reservationController,
            controllerAs: 'reservation',
            targetEvent: $event,
            locals: {
              shopkeeperId: $rootScope.currentUser.id,
              products: vm.products,
              surveys: vm.surveys,
              timeSlot: timeSlot
            }
          })
          .then(function(activity) {
            activity.timeSlot = timeSlot;
            vm.timeSlots.splice(vm.timeSlots.indexOf(timeSlot), 1);
            vm.activities.push(activity);
          });
      }

      function viewActivity(hour) {
        var activity = getActivity(hour);
        $state.go('main.view.activities.selected', { id: activity.id })
      }

      function cancelActivity(hour, $event) {
        var activity = getActivity(hour);
        var timeSlot = activity.timeSlot;
        var confirm = $mdDialog.confirm()
          .title('Are you sure to cancel this activity?')
          .ariaLabel('Deleting Confirmation')
          .targetEvent($event)
          .ok('Yes')
          .cancel('No');
        $mdDialog.show(confirm).then(function() {
          Shopkeeper
            .activities
            .destroyById({
              id: $rootScope.currentUser.id,
              fk: activity.id
            })
            .$promise
            .then(function() {
              vm.activities.splice(vm.activities.indexOf(activity), 1);
              vm.timeSlots.push(timeSlot);
            })
        });
      }

      function cancelReservation(hour, $event) {
        var timeSlot = getTimeSlot(hour);
        var activity = getActivity(hour);
        $mdDialog
          .show({
            template:
            '<md-dialog aria-label="Cancel Reservation">' +
            '  <md-dialog-content class="md-dialog-content">' +
            '    <h2 class="md-title">Are you sure to cancel the reservation and close this slot?</h2>' +
            '    <p>If yes, please provide a reason to shopkeeper for canceling this reservation</p>' +
            '    <md-input-container class="full-width">' +
            '      <label>Reason</label>' +
            '      <textarea rows="3" md-select-on-focus md-maxlength="200" ng-model="reason" required></textarea>' +
            '    </md-input-container>' +
            '  </md-dialog-content>' +
            '  <md-dialog-actions layout="row">' +
            '    <md-button ng-click="submit()" class="md-primary" ng-disabled="!reason">' +
            '      Yes' +
            '    </md-button>' +
            '    <md-button ng-click="cancel()" class="md-primary">' +
            '      No' +
            '    </md-button>' +
            '  </md-dialog-actions>' +
            '</md-dialog>',
            controller: function($scope) {
              $scope.reason = '';
              $scope.submit = function() {
                $mdDialog.hide($scope.reason);
              };
              $scope.cancel = function() {
                $mdDialog.cancel();
              };
            },
            targetEvent: $event
          })
          .then(function(reason) {
            TimeSlot
              .cancelReservation({
                id: timeSlot.id,
                reason: reason
              })
              .$promise
              .then(function() {
                vm.timeSlots.splice(vm.timeSlots.indexOf(timeSlot), 1);
                vm.activities.splice(vm.activities.indexOf(activity), 1);
              })
          });
      }

      function reservationController(shopkeeperId, products, surveys, timeSlot) {
        var vm = this;
        vm.productId = null;
        vm.surveyId = null;
        vm.products = products;
        vm.surveys = surveys;
        vm.date = moment(timeSlot.date).format('DD/MM/YYYY');
        vm.hour = timeSlot.hour;
        vm.submit = submit;
        vm.cancel = cancel;

        function submit() {
          Shopkeeper
            .activities
            .create(
              { id: shopkeeperId },
              {
                productId: vm.productId,
                surveyId: vm.surveyId,
                shopkeeperId: shopkeeperId,
                timeSlotId: timeSlot.id
              }
            )
            .$promise
            .then(function(activity) {
              $mdDialog.hide(activity);
            })
        }

        function cancel() {
          $mdDialog.cancel();
        }
      }
    }
  }

})();
