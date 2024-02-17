import { useStores } from '@/hooks';
import React, { useState } from 'react';
import { ReadOnlyEditor } from '@/components/Editor';
import { observer } from 'mobx-react';
import RenderDocBtns from './RenderDocBtns';
import DocTocPanel from './DocTocPanel';
import s from "./EditDoc.module.less";
import { Card } from 'antd';


const ReadDoc: React.FC = () => {
  const [matchKeywordList, setMatchKeywordList] = useState<string[]>([]);

  const docStore = useStores('docStore');
  const ideaStore = useStores('ideaStore');
  const editorStore = useStores('editorStore');
  const projectStore = useStores('projectStore');
  const appStore = useStores('appStore');

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

  return (
    <Card extra={<RenderDocBtns keyWordList={matchKeywordList} />} bordered={false}
      bodyStyle={{ paddingBottom: "0px", width: calcWidth() }}>
      <div className={s.doc_wrap}>
        {editorStore.tocList.length > 0 && <DocTocPanel />}
        <div className={s.read_doc}>
          {<ReadOnlyEditor content={docStore.curDoc?.base_info.content ?? ""} keywordList={ideaStore.keywordList}
            keywordCallback={(kwList) => setMatchKeywordList(kwList)}
            tocCallback={(result) => editorStore.tocList = result} />}
        </div>
      </div>
    </Card>
  );
};

export default observer(ReadDoc);
