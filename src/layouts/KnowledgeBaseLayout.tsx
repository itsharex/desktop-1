import React from 'react';
import type { IRouteConfig } from '@/routes';
import { renderRoutes } from 'react-router-config';
import { APP_PROJECT_KB_DOC_PATH } from '@/utils/constant';
import style from './style.module.less';
import { useLocation } from 'react-router-dom';
import KnowledgeBaseMenu from '@/components/KnowledgeBaseMenu';
import { useStores } from '@/hooks';
import { observer } from 'mobx-react';
import { PAGE_TYPE as DOC_PAGE_TYPE } from '@/stores/docSpace';


const KnowledgeBaseLayout: React.FC<{ route: IRouteConfig }> = ({ route }) => {
  const { pathname } = useLocation();

  const docSpaceStore = useStores('docSpaceStore');

  let subRoutes: IRouteConfig[] = [];
  route.routes?.forEach(subRoute => {
    if (pathname.startsWith(subRoute.path)) {
      subRoutes = subRoute.routes ?? [];
    }
  });
  return (
    <>
      <div className={style.knowledgeBaseLayout}>
        {renderRoutes(route.routes)}
        {!(docSpaceStore.pageType == DOC_PAGE_TYPE.PAGE_DOC) && <KnowledgeBaseMenu />}
      </div>
      {!(pathname == APP_PROJECT_KB_DOC_PATH) && (
        <div className={style.toolsModel}>{renderRoutes(subRoutes)}</div>
      )}
    </>
  );
};

export default observer(KnowledgeBaseLayout);
