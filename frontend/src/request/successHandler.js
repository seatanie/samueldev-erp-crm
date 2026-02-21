import { notification } from 'antd';

import codeMessage from './codeMessage';

const successHandler = (response, options = { notifyOnSuccess: false, notifyOnFailed: true }) => {
  const { data } = response;
  if (data && data.success === true) {
    const message = response.data && data.message;
    const successText = message || codeMessage[response.status];

    if (options.notifyOnSuccess) {
      notification.success({
        message: `Request success`,
        description: successText,
        duration: 2,
        maxCount: 2,
      });
    }
  } else {
    const message = response.data && data.message;
    const errorText = message || codeMessage[response.status];
    const { status } = response;
    if (options.notifyOnFailed) {
      notification.error({
        message: `Request error ${status}`,
        description: errorText,
        duration: 4,
        maxCount: 2,
      });
    }
  }
};

export default successHandler;
