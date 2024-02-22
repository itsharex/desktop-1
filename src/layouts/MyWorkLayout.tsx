import { Empty, Spin } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import { useStores } from '@/hooks';
import type { IRouteConfig } from '@/routes';
import style from './style.module.less';
import { renderRoutes } from 'react-router-config';
import { useLocation } from 'react-router-dom';
import { APP_PROJECT_MY_WORK_PATH } from '@/utils/constant';
import ProjectMyWork from '@/pages/Project/MyWork';
import { ErrorBoundary } from '@/components/ErrorBoundary';



const MyWorkLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const projectStore = useStores('projectStore');
  const appStore = useStores('appStore');
  const { pathname } = useLocation();

  const calcWidth = () => {
    let subWidth = 60;
    if (projectStore.showChatAndComment) {
      subWidth += 400;
    }
    if (appStore.focusMode == false) {
      subWidth += 200;
    }
    return `calc(100vw - ${subWidth}px)`;
  };


  if (!projectStore.curProjectId) {
    return (
      <>
        {!projectStore.projectList.length ? (
          <Empty style={{ marginTop: '10%' }} />
        ) : (
          <div>
            <Spin />
            加载中...
          </div>
        )}
      </>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{ width: calcWidth() }}>
        <ProjectMyWork />
        {pathname != APP_PROJECT_MY_WORK_PATH && (
          <div className={style.toolsModel}>{renderRoutes(route.routes)}</div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default observer(MyWorkLayout);
