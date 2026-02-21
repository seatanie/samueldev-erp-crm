import * as actionTypes from './types';
import { request } from '@/request';

const dispatchSettingsData = (datas) => {
  const settingsCategory = {};

  datas.map((data) => {
    settingsCategory[data.settingCategory] = {
      ...settingsCategory[data.settingCategory],
      [data.settingKey]: data.settingValue,
    };
  });

  return settingsCategory;
};

export const settingsAction = {
  resetState: () => (dispatch) => {
    dispatch({
      type: actionTypes.RESET_STATE,
    });
  },
  updateCurrency:
    ({ data }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.UPDATE_CURRENCY,
        payload: data,
      });
    },
  update:
    ({ entity, settingKey, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      let data = await request.patch({
        entity: entity + '/updateBySettingKey/' + settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        if (data.success === true) {
          const payload = dispatchSettingsData(data.result);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(data.result))
          );

          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  updateMany:
    ({ entity, jsonData }) =>
    async (dispatch) => {
      console.log('🚀 Iniciando actualización de configuraciones:', { entity, jsonData });
      
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });
      
      try {
        console.log('📡 Enviando petición PATCH a:', entity + '/updateManySetting');
        
        let updateResult = await request.patch({
          entity: entity + '/updateManySetting',
          jsonData,
        });

        console.log('✅ Resultado de actualización:', updateResult);

        if (updateResult.success === true) {
          console.log('📋 Obteniendo lista actualizada de configuraciones...');
          
          let listResult = await request.listAll({ entity });

          console.log('📋 Resultado de lista:', listResult);

          if (listResult.success === true) {
            const payload = dispatchSettingsData(listResult.result);
            window.localStorage.setItem(
              'settings',
              JSON.stringify(dispatchSettingsData(listResult.result))
            );

            dispatch({
              type: actionTypes.REQUEST_SUCCESS,
              payload,
            });
            
            console.log('🎉 Configuraciones actualizadas exitosamente');
          } else {
            console.error('❌ Error obteniendo lista de configuraciones:', listResult);
            dispatch({
              type: actionTypes.REQUEST_FAILED,
            });
          }
        } else {
          console.error('❌ Error actualizando configuraciones:', updateResult);
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } catch (error) {
        console.error('💥 Error excepcional actualizando configuraciones:', error);
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  list:
    ({ entity }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.listAll({ entity });

      if (data.success === true) {
        const payload = dispatchSettingsData(data.result);
        window.localStorage.setItem('settings', JSON.stringify(dispatchSettingsData(data.result)));

        dispatch({
          type: actionTypes.REQUEST_SUCCESS,
          payload,
        });
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  upload:
    ({ entity, settingKey, jsonData }) =>
    async (dispatch) => {
      dispatch({
        type: actionTypes.REQUEST_LOADING,
      });

      let data = await request.upload({
        entity: entity,
        id: settingKey,
        jsonData,
      });

      if (data.success === true) {
        dispatch({
          type: actionTypes.REQUEST_LOADING,
        });

        let data = await request.listAll({ entity });

        if (data.success === true) {
          const payload = dispatchSettingsData(data.result);
          window.localStorage.setItem(
            'settings',
            JSON.stringify(dispatchSettingsData(data.result))
          );
          dispatch({
            type: actionTypes.REQUEST_SUCCESS,
            payload,
          });
        } else {
          dispatch({
            type: actionTypes.REQUEST_FAILED,
          });
        }
      } else {
        dispatch({
          type: actionTypes.REQUEST_FAILED,
        });
      }
    },
  // Función específica para subir logo de empresa
  uploadCompanyLogo: (formData) => async (dispatch) => {
    try {
      console.log('🚀 Iniciando upload de logo de empresa...');
      
      // Importar la función uploadCompanyLogo de request.js
      const { uploadCompanyLogo: uploadLogo } = await import('@/request/request');
      
      const response = await uploadLogo(formData);
      
      if (response.success) {
        console.log('✅ Logo subido exitosamente:', response);
        
        // Recargar la lista de configuraciones
        dispatch(settingsAction.list({ entity: 'setting' }));
        
        return response;
      } else {
        console.error('❌ Error en respuesta del servidor:', response);
        return response;
      }
    } catch (error) {
      console.error('💥 Error excepcional subiendo logo:', error);
      throw error;
    }
  },
};
