import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { App } from 'antd';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const SamuelDevOs = lazy(() => import('./apps/SamuelDevOs'));

export default function RoutApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <App>
          <Suspense fallback={<PageLoader />}>
            <SamuelDevOs />
          </Suspense>
        </App>
      </Provider>
    </BrowserRouter>
  );
}
