(function() {
  'use strict';

  angular
    .module('chipForHire')
    .factory('socket', socket);

  /** @ngInject **/
  function socket(io, $rootScope, LoopBackAuth) {
    var socket = null;
    return {
      connect: function() {
        socket = io.connect();
        socket.on('connect', function() {
          socket.emit('authentication', {
            id: LoopBackAuth.accessTokenId,
            userId: $rootScope.currentUser.id,
            role: $rootScope.currentUser.role
          });
        });
      },
      on: function (eventName, callback) {
        if (!socket) return;
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      disconnect: function() {
        if (!socket) return;
        socket.disconnect();
        socket = null;
      }
    };
  }
})();
