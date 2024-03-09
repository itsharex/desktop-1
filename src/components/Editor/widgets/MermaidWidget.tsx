import React, { useState, useRef, useEffect } from 'react';
import { type WidgetProps } from './common';
import mermaid from 'mermaid';
import { Tabs, Select } from 'antd';
import { uniqId } from '@/utils/utils';
import CodeEditor from '@uiw/react-textarea-code-editor';
import EditorWrap from '../components/EditorWrap';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import style from './MermaidWidget.module.less';
import { QuestionCircleOutlined } from '@ant-design/icons/lib/icons';
import { blockDemo, c4Demo, classDemo, erDemo, flowDemo, ganttDemo, gitDemo, journeyDemo, mindMapDemo, pieDemo, quadrantDemo, requirementDemo, seqDemo, stateDemo, timelineDemo, xychartDemo, zenumlDemo } from '@/utils/mermaid';
import { observer } from 'mobx-react';

//为了防止编辑器出错，WidgetData结构必须保存稳定

interface WidgetData {
  spec: string;
}

export const mermaidWidgetInitData: WidgetData = {
  spec: '',
};

const EditMermaid: React.FC<WidgetProps> = observer((props) => {
  const data = props.initData as WidgetData;
  const [spec, setSpec] = useState(data.spec);
  const [activateKey, setActivateKey] = useState('1');
  const graphRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

  const setDemo = (demoName: string) => {
    let value = '';
    switch (demoName) {
      case 'flow': {
        value = flowDemo;
        break;
      }
      case 'seq': {
        value = seqDemo;
        break;
      }
      case 'class': {
        value = classDemo;
        break;
      }
      case 'state': {
        value = stateDemo;
        break;
      }
      case 'gantt': {
        value = ganttDemo;
        break;
      }
      case 'pie': {
        value = pieDemo;
        break;
      }
      case 'er': {
        value = erDemo;
        break;
      }
      case 'journey': {
        value = journeyDemo;
        break;
      }
      case 'git': {
        value = gitDemo;
        break;
      }
      case 'quadrant': {
        value = quadrantDemo;
        break;
      }
      case 'requirement': {
        value = requirementDemo;
        break;
      }
      case 'c4': {
        value = c4Demo;
        break;
      }
      case 'mindMap': {
        value = mindMapDemo;
        break;
      }
      case 'timeline': {
        value = timelineDemo;
        break;
      }
      case 'zenuml': {
        value = zenumlDemo;
        break;
      }
      case 'xychart': {
        value = xychartDemo;
        break;
      }
      case 'block': {
        value = blockDemo;
        break;
      }
      default:
        value = '';
    }
    setSpec(value);
    props.writeData({ spec: value });
  };

  const preview = async () => {
    if (graphRef.current == null) {
      return;
    }
    try {
      const ok = await mermaid.parse(spec);
      if (!ok) {
        graphRef.current.innerHTML = '格式错误';
        return;
      }
      const { svg, bindFunctions } = await mermaid.render('__inEditor', spec);
      graphRef.current.innerHTML = svg;
      bindFunctions?.(graphRef.current);
    } catch (e) {
      if (graphRef.current != null) {
        graphRef.current.innerHTML = '格式错误';
      }
    }
  };

  useEffect(() => {
    if (activateKey == '2') {
      setTimeout(() => preview(), 300);
    }
  }, [spec, activateKey]);


  return (
    <ErrorBoundary>
      <EditorWrap onChange={() => props.removeSelf()}>
        <Tabs
          defaultActiveKey="1"
          onChange={(activeKey) => {
            setActivateKey(activeKey);
          }}
          tabBarExtraContent={{
            right: (
              <>
                <Select
                  style={{ width: 150 }}
                  placeholder="请选择图表类型"
                  onChange={(value) => {
                    setDemo(value);
                  }}
                  className={style.select}
                >
                  <Select.Option key="flow" value="flow">
                    流程图
                  </Select.Option>
                  <Select.Option key="seq" value="seq">
                    时序图
                  </Select.Option>
                  <Select.Option key="class" value="class">
                    类图
                  </Select.Option>
                  <Select.Option key="state" value="state">
                    状态图
                  </Select.Option>
                  <Select.Option key="gantt" value="gantt">
                    甘特图
                  </Select.Option>
                  <Select.Option key="pie" value="pie">
                    圆饼图
                  </Select.Option>
                  <Select.Option key="er" value="er">
                    ER图
                  </Select.Option>
                  <Select.Option key="journey" value="journey">
                    用户体验图
                  </Select.Option>
                  <Select.Option key="git" value="git">
                    GIT历史
                  </Select.Option>
                  <Select.Option key="quadrant" value="quadrant">
                    象限图
                  </Select.Option>
                  <Select.Option key="requirement" value="requirement">
                    需求图
                  </Select.Option>
                  <Select.Option key="c4" value="c4">
                    C4图
                  </Select.Option>
                  <Select.Option key="mindMap" value="mindMap">
                    思维导图
                  </Select.Option>
                  <Select.Option key="timeline" value="timeline">
                    时间轴
                  </Select.Option>
                  <Select.Option key="zenuml" value="zenuml">
                    ZenUML
                  </Select.Option>
                  <Select.Option key="xychart" value="xychart">
                    柱状图
                  </Select.Option>
                  <Select.Option key="block" value="block">
                    框图
                  </Select.Option>
                </Select>
                <a href="https://mermaid-js.github.io/mermaid/#/" target="_blank" rel="noreferrer"><QuestionCircleOutlined style={{ marginLeft: "10px" }} /></a>
              </>
            ),
          }}
        >
          <Tabs.TabPane tab="编辑(mermaid)" key="1">
            <CodeEditor
              value={spec}
              language="mermaid"
              minHeight={200}
              onChange={(e) => {
                setSpec(e.target.value);
                props.writeData({ spec: e.target.value });
              }}
              style={{
                fontSize: 14,
                backgroundColor: '#f5f5f5',
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="预览" key="2" style={{ overflowY: 'scroll', maxHeight: 300 }}>
            <div ref={graphRef} />
          </Tabs.TabPane>
        </Tabs>
      </EditorWrap>
    </ErrorBoundary>
  );
});

const ViewMermaid: React.FC<WidgetProps> = (props) => {
  const data = props.initData as WidgetData;
  const graphRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [renderId] = useState('mermaid' + uniqId());

  const showView = async () => {
    if (graphRef.current == null) {
      return;
    }
    try {
      const ok = await mermaid.parse(data.spec);
      if (!ok) {
        graphRef.current.innerHTML = '格式错误';
        return;
      }
      const { svg, bindFunctions } = await mermaid.render(renderId, data.spec);
      graphRef.current.innerHTML = svg;
      bindFunctions?.(graphRef.current);
    } catch (e) {
      if (graphRef.current != null) {
        graphRef.current.innerHTML = '格式错误';
      }
    }
  };

  useEffect(() => {
    setTimeout(() => showView(), 300);
  });

  return (
    <ErrorBoundary>
      <EditorWrap>
        <div ref={graphRef} />
      </EditorWrap>
    </ErrorBoundary>
  );
};

export const MermaidWidget: React.FC<WidgetProps> = (props) => {
  if (props.editMode) {
    return <EditMermaid {...props} />;
  } else {
    return <ViewMermaid {...props} />;
  }
};
