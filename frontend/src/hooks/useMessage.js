import { message } from 'antd';

export const useMessage = () => {
  return {
    success: (content, duration = 3) => {
      message.success({
        content,
        duration,
        style: {
          marginTop: '20vh',
        },
      });
    },
    error: (content, duration = 4) => {
      message.error({
        content,
        duration,
        style: {
          marginTop: '20vh',
        },
      });
    },
    warning: (content, duration = 4) => {
      message.warning({
        content,
        duration,
        style: {
          marginTop: '20vh',
        },
      });
    },
    info: (content, duration = 3) => {
      message.info({
        content,
        duration,
        style: {
          marginTop: '20vh',
        },
      });
    },
    loading: (content, duration = 0) => {
      return message.loading({
        content,
        duration,
        style: {
          marginTop: '20vh',
        },
      });
    },
  };
};
