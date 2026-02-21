const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const createUserController = require('@/controllers/middlewaresControllers/createUserController');
const toggleStatus = require('./toggleStatus');
const create = require('./create');

// Combinar controlador CRUD con controlador de usuario
const adminCRUD = createCRUDController('Admin');
const adminUser = createUserController('Admin');

// Exportar todos los métodos combinados
module.exports = {
  ...adminCRUD,
  ...adminUser,
  create, // Usar nuestro controlador personalizado
  toggleStatus,
};
