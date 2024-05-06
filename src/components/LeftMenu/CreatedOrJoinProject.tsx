//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Checkbox, Form, Input, message, Modal, Space, Tabs } from 'antd';
import React, { useState } from 'react';
import type { BasicProjectInfo } from '@/api/project';
import { add_tag, create, MAIN_CONTENT_CONTENT_LIST, update_tip_list } from '@/api/project';
import { useStores } from '@/hooks';
import { request } from '@/utils/request';
import { useCommonEditor } from '@/components/Editor';
import { useHistory } from 'react-router-dom';
import { APP_PROJECT_HOME_PATH, PROJECT_SETTING_TAB } from '@/utils/constant';
import { unixTipList } from '@/pages/Project/Setting/components/TipListSettingPanel';
import randomColor from 'randomcolor';
import { FILE_OWNER_TYPE_NONE } from '@/api/fs';
import { create_folder } from '@/api/project_entry';
import { joinOrgOrProject } from './join';

type CreatedOrJoinProjectProps = {
  visible: boolean;
  onChange: (boo: boolean) => void;
};

const CreatedOrJoinProject = (props: CreatedOrJoinProjectProps) => {
  const { visible, onChange } = props;

  const history = useHistory();

  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const orgStore = useStores('orgStore');

  const [prjName, setPrjName] = useState("");
  const [activeKey, setActiveKey] = useState("create");
  const [linkText, setLinkText] = useState('');
  const [enableEntryDoc, setEnableEntryDoc] = useState(false);
  const [enableEntryPages, setEnableEntryPages] = useState(false);
  const [enableEntryBoard, setEnableEntryBoard] = useState(false);
  const [enableEntryFile, setEnableEntryFile] = useState(false);
  const [enableEntryApiColl, setEnableEntryApiColl] = useState(false);
  const [enableEntryDataAnno, setEnableEntryDataAnno] = useState(false);


  const { editor, editorRef } = useCommonEditor({
    placeholder: "请输入项目介绍",
    content: "",
    fsId: "",
    ownerType: FILE_OWNER_TYPE_NONE,
    ownerId: "",
    projectId: "",
    historyInToolbar: false,
    clipboardInToolbar: false,
    commonInToolbar: false,
    widgetInToolbar: false,
    showReminder: false,
  });

  const createProject = async () => {
    const content = editorRef.current?.getContent() ?? { type: "doc" };

    const data: BasicProjectInfo = {
      project_name: prjName,
      project_desc: JSON.stringify(content),
    };
    try {
      const res = await request(create(userStore.sessionId, data, enableEntryDoc, enableEntryPages, enableEntryBoard, enableEntryFile, enableEntryApiColl, enableEntryDataAnno));
      message.success('创建项目成功');
      //设置经验集锦
      const tipList = unixTipList.split("\n").map(tip => tip.trim()).filter(tip => tip != "");
      await request(update_tip_list({
        session_id: userStore.sessionId,
        project_id: res.project_id,
        tip_list: tipList,
      }));

      //设置标签
      for (const tag of ["干的不错", "待改进"]) {
        await request(add_tag({
          session_id: userStore.sessionId,
          project_id: res.project_id,
          tag_name: tag,
          bg_color: randomColor({ luminosity: "light", format: "rgba", alpha: 0.8 }),
          use_in_task: false,
          use_in_bug: false,
          use_in_req: false,
          use_in_sprit_summary: true,
          use_in_entry: false,
        }));
      }

      //创建默认目录
      for (const folderTitle of ["工作计划", "文档", "静态网页", "信息面板", "文件", "接口集合"]) {
        await request(create_folder({
          session_id: userStore.sessionId,
          project_id: res.project_id,
          folder_title: folderTitle,
          parent_folder_id: "",
        }));
      }

      await projectStore.updateProject(res.project_id);
      onChange(false);
      projectStore.setCurProjectId(res.project_id).then(() => {
        projectStore.projectHome.homeType = MAIN_CONTENT_CONTENT_LIST;
        history.push(APP_PROJECT_HOME_PATH);
        projectStore.showProjectSetting = PROJECT_SETTING_TAB.PROJECT_SETTING_ALARM;
      });
      orgStore.setCurOrgId("");
    } catch (e) {
      console.log(e);
    }
  };

  const checkValid = () => {
    if (activeKey == "create") {
      return prjName != "";
    } else if (activeKey == "join") {
      return linkText.trim().length != 0;
    }
    return false;
  };


  return (
    <Modal open={visible} title="创建/加入项目" width={800}
      bodyStyle={{ padding: "2px 10px" }}
      okText={activeKey == "create" ? "创建" : "加入"} okButtonProps={{ disabled: !checkValid() }}
      onCancel={e => {
        e.stopPropagation();
        e.preventDefault();
        onChange(false);
      }}
      onOk={e => {
        e.stopPropagation();
        e.preventDefault();
        if (activeKey == "create") {
          createProject();
        } else if (activeKey == "join") {
          joinOrgOrProject(linkText, userStore, projectStore, orgStore, history).then(() => onChange(false));
        }
      }}>
      <Tabs type="card" activeKey={activeKey} onChange={value => setActiveKey(value)}
        items={[
          {
            key: "create",
            label: "创建项目",
            children: (
              <Form labelCol={{ span: 3 }} style={{ paddingRight: "20px" }}>
                <Form.Item label="项目名称">
                  <Input allowClear placeholder={`请输入项目名称`} style={{ borderRadius: '6px' }} value={prjName} onChange={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setPrjName(e.target.value.trim());
                  }} />
                </Form.Item>
                <Form.Item label="项目功能">
                  <Space>
                    <Checkbox checked={enableEntryDoc} onChange={e => {
                      e.stopPropagation();
                      setEnableEntryDoc(e.target.checked);
                    }}>项目文档</Checkbox>
                    <Checkbox checked={enableEntryBoard} onChange={e => {
                      e.stopPropagation();
                      setEnableEntryBoard(e.target.checked);
                    }}>信息面板</Checkbox>
                    <Checkbox checked={enableEntryPages} onChange={e => {
                      e.stopPropagation();
                      setEnableEntryPages(e.target.checked);
                    }}>静态网页</Checkbox>
                    <Checkbox checked={enableEntryFile} onChange={e => {
                      e.stopPropagation();
                      setEnableEntryFile(e.target.checked);
                    }}>项目文件</Checkbox>
                    <Checkbox checked={enableEntryApiColl} onChange={e => {
                      e.stopPropagation();
                      setEnableEntryApiColl(e.target.checked);
                    }}>接口集合</Checkbox>
                    <Checkbox checked={enableEntryDataAnno} onChange={e => {
                      e.stopPropagation();
                      setEnableEntryDataAnno(e.target.checked);
                    }}>数据标注</Checkbox>
                  </Space>
                </Form.Item>
                <Form.Item label="项目介绍">
                  <div className="_projectEditContext" style={{ marginTop: '-12px' }}>
                    {editor}
                  </div>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: "join",
            label: "加入项目/团队",
            children: (
              <Form labelCol={{ span: 2 }} style={{ paddingRight: "20px" }}>
                <Form.Item label="邀请码">
                  <Input
                    placeholder="请输入邀请码"
                    allowClear
                    onChange={(e) => setLinkText(e.target.value.trim())}
                  />
                </Form.Item>
              </Form>
            ),
          }
        ]} />
    </Modal>
  );
};

export default CreatedOrJoinProject;
