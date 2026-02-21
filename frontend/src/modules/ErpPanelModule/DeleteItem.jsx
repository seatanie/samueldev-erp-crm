import { useEffect, useState, useRef } from 'react';
import { Modal, message } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { useErpContext } from '@/context/erp';
import { selectDeletedItem } from '@/redux/erp/selectors';
import { valueByString } from '@/utils/helpers';

export default function Delete({ config }) {
  let {
    entity,
    deleteModalLabels,
    deleteMessage = 'Do you want delete : ',
    modalTitle = 'Remove Item',
  } = config;
  const dispatch = useDispatch();
  const { current, isLoading, isSuccess, isError } = useSelector(selectDeletedItem);
  const { state, erpContextAction } = useErpContext();
  const { deleteModal } = state;
  const { modal } = erpContextAction;
  const [displayItem, setDisplayItem] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false);

  // Reset del flag cuando se abre el modal
  useEffect(() => {
    if (deleteModal.isOpen) {
      hasProcessedRef.current = false;
      setIsProcessing(false);
    }
  }, [deleteModal.isOpen]);

  // Manejar el resultado de la eliminación
  useEffect(() => {
    if (isSuccess && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      setIsProcessing(false);
      modal.close();
      message.success('Elemento eliminado exitosamente');
      
      // Recargar la lista después de un pequeño delay
      setTimeout(() => {
        const options = { page: 1, items: 10 };
        dispatch(erp.list({ entity, options }));
      }, 100);
    }
    
    if (isError && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      setIsProcessing(false);
      modal.close();
      message.error('Error al eliminar el elemento');
    }
  }, [isSuccess, isError, modal, dispatch, entity]);

  // Actualizar el display item cuando cambia current
  useEffect(() => {
    if (current && deleteModalLabels) {
      try {
        let labels = deleteModalLabels.map((x) => valueByString(current, x)).join(' ');
        setDisplayItem(labels);
      } catch (error) {
        console.error('Error setting display item:', error);
        setDisplayItem(current.name || current._id || 'Elemento');
      }
    }
  }, [current, deleteModalLabels]);

  const handleOk = () => {
    if (isLoading || isProcessing || !current) return;
    
    setIsProcessing(true);
    const id = current._id;
    dispatch(erp.delete({ entity, id }));
  };

  const handleCancel = () => {
    if (!isLoading && !isProcessing) {
      modal.close();
    }
  };

  return (
    <Modal
      title={modalTitle}
      open={deleteModal.isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading || isProcessing}
      okText="Eliminar"
      cancelText="Cancelar"
      okButtonProps={{ 
        danger: true,
        disabled: isProcessing || isLoading 
      }}
    >
      <p>
        {deleteMessage}
        <strong>{displayItem}</strong>
      </p>
    </Modal>
  );
}
