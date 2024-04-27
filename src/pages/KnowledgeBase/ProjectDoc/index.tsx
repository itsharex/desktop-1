//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React from 'react';
import s from './index.module.less';
import { observer } from 'mobx-react';
import { useStores } from '@/hooks';
import ReadDoc from './components/ReadDoc';
import WriteDoc from './components/WriteDoc';

const ProjectDoc = () => {
  const appStore = useStores('appStore');

  return (
    <div className={s.doc_wrap} style={{ width: "100%" }}>
      {appStore.inEdit && <WriteDoc />}
      {!appStore.inEdit && <ReadDoc />}
    </div>
  );
};

export default observer(ProjectDoc);
