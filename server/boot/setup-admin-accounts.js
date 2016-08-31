// var _ = require('lodash');
//
// module.exports = function(app) {
//   var mongoDS = app.datasources.mongoDB;
//   var Admin = app.models.Admin;
//   var Role = app.models.Role;
//   var RoleMapping = app.models.RoleMapping;
//
//   var admins = [
//     {
//       name: 'admin',
//       email: 'admin@admin.com',
//       password: 'admin'
//     }
//   ];
//
//   createAdmins(admins);
//
//   function createAdmins(admins) {
//     mongoDS.automigrate('Admin', function(err) {
//       if (err) return err;
//
//       Admin.create(admins, function(err, admins) {
//         if (err) return err;
//
//         console.log('Created admin:', admins);
//
//         mongoDS.automigrate('Role', function(err) {
//           if (err) return err;
//
//           Role.create({
//             name: 'admin'
//           }, function(err, role) {
//             if (err) throw err;
//
//             console.log('Created role:', role);
//
//             mongoDS.automigrate('RoleMapping', function(err) {
//               if (err) return err;
//
//               var principals = [];
//               _.forEach(admins, function(admin) {
//                 principals.push({
//                   principalType: RoleMapping.USER,
//                   principalId: admin.id
//                 });
//               });
//               role.principals.create(principals, function(err, principal) {
//                 if (err) throw err;
//
//                 console.log('Created principal:', principals);
//               });
//             });
//           });
//         });
//       });
//     });
//   }
// };
