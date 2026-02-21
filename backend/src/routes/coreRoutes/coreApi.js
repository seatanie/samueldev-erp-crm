const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { catchErrors } = require('@/handlers/errorHandlers');

const router = express.Router();

const adminController = require('@/controllers/coreControllers/adminController');
const settingController = require('@/controllers/coreControllers/settingController');

const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');

console.log('🚀 CARGANDO RUTAS CORE - Incluyendo /setting/upload-logo');

// //_______________________________ Admin management_______________________________

// Rutas CRUD completas para Admin
router.route('/admin/create').post(catchErrors(adminController.create));
router.route('/admin/read/:id').get(catchErrors(adminController.read));
router.route('/admin/update/:id').patch(catchErrors(adminController.update));
router.route('/admin/delete/:id').delete(catchErrors(adminController.delete));
router.route('/admin/list').get(catchErrors(adminController.list));
router.route('/admin/listAll').get(catchErrors(adminController.listAll));
router.route('/admin/search').get(catchErrors(adminController.search));
router.route('/admin/filter').get(catchErrors(adminController.filter));
router.route('/admin/summary').get(catchErrors(adminController.summary));

// Rutas específicas para Admin
router.route('/admin/password-update/:id').patch(catchErrors(adminController.updatePassword));
router.route('/admin/toggle-status/:id').patch(catchErrors(adminController.toggleStatus));

//_______________________________ Admin Profile _______________________________

router.route('/admin/profile/password').patch(catchErrors(adminController.updateProfilePassword));
router
  .route('/admin/profile/update')
  .patch(
    singleStorageUpload({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    catchErrors(adminController.updateProfile)
  );

// //____________________________________________ API for Global Setting _________________

router.route('/setting/create').post(catchErrors(settingController.create));
router.route('/setting/read/:id').get(catchErrors(settingController.read));
router.route('/setting/update/:id').patch(catchErrors(settingController.update));
router.route('/setting/search').get(catchErrors(settingController.search));
router.route('/setting/list').get(catchErrors(settingController.list));
router.route('/setting/listAll').get(catchErrors(settingController.listAll));
router.route('/setting/filter').get(catchErrors(settingController.filter));
router
  .route('/setting/readBySettingKey/:settingKey')
  .get(catchErrors(settingController.readBySettingKey));
router.route('/setting/listBySettingKey').get(catchErrors(settingController.listBySettingKey));

// Ruta para configuración de PDF
router
  .route('/setting/updatePDFSettings')
  .patch(catchErrors(settingController.updatePDFSettings));

router.route('/setting/updateManySetting').patch(catchErrors(settingController.updateManySetting));

console.log('✅ RUTAS CORE REGISTRADAS EXITOSAMENTE');

module.exports = router;
