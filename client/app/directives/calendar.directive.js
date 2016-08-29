(function() {
  'use strict';

  angular
    .module('chipForHire')
    .directive('calendar', calendar);

  /** @ngInject */
  function calendar(moment) {
    var directive = {
      restrict: 'A',
      scope: {},
      bindToController: {
        timeSlots: '='
      },
      controller: controller,
      controllerAs: 'cal',
      templateUrl: 'app/views/calendar.html'
    };

    return directive;

    function controller() {
      var vm = this;
      vm.today = moment().startOf('day');
      vm.currentDate = vm.today;
      vm.startDate = vm.currentDate.clone().startOf('week');
      vm.hours = ['09', '10', '11', '12', '13', '14', '15', '16'];
      vm.reservation = null;
      vm.booking = null;
      vm.isCurrentWeek = isCurrentWeek;
      vm.isToday = isToday;
      vm.isBeforeToday = isBeforeToday;
      vm.isCurrentDay = isCurrentDay;
      vm.isWeekend = isWeekend;
      vm.selectDay = selectDay;
      vm.hasReservation = hasReservation;
      vm.nextWeek = nextWeek;
      vm.previousWeek = previousWeek;
      vm.reserve = reserve;
      vm.isReserved = isReserved;

      getWeek();

      function getWeek() {
        vm.week = [];
        for (var i = 0; i < 7; i++) {
          vm.week.push(vm.startDate.clone().add(i, 'days'));
        }
        return vm.week;
      }

      function isCurrentWeek() {
        return vm.startDate.week() == moment().week();
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
          vm.startDate = vm.currentDate.clone().startOf('week');
          getWeek();
        }
      }

      function isWeekend(day) {
        return day.format('d') == '0' || day.format('d') == '6';
      }

      function hasReservation(day) {
        return vm.reservation && vm.reservation.date.isSame(day);
      }

      function nextWeek() {
        vm.startDate.add(7, 'days');
        getWeek();
      }

      function previousWeek() {
        vm.startDate.subtract(7, 'days');
        getWeek();
      }

      function reserve(hour) {
        vm.reservation = {
          date: vm.currentDate,
          hour: hour,
          reserved: true
        };
      }

      function isReserved(hour) {
        return vm.reservation &&
          vm.reservation.date.isSame(vm.currentDate) &&
          vm.reservation.hour == hour
      }
    }
  }

})();
