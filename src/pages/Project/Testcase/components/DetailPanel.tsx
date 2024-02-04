import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useStores } from "@/hooks";
import type { CaseDetailInfo, TestMethod, PermSetting } from "@/api/project_testcase";
import { get_case, update_case, update_case_content, update_case_perm } from "@/api/project_testcase";
import { request } from "@/utils/request";
import { Button, Card, Checkbox, Form, Select, Space } from "antd";
import { EditText } from "@/components/EditCell/EditText";
import { ReadOnlyEditor, useCommonEditor } from "@/components/Editor";
import { FILE_OWNER_TYPE_TEST_CASE } from "@/api/fs";
import UserPhoto from "@/components/Portrait/UserPhoto";

const DetailPanel = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const memberStore = useStores('memberStore');

    const [detailInfo, setDetailInfo] = useState<CaseDetailInfo | null>(null);
    const [inEditContent, setInEditContent] = useState(false);

    const [testMethod, setTestMethod] = useState<TestMethod>({
        unit_test: false,
        ci_test: false,
        load_test: false,
        manual_test: false,
    });
    const [permSetting, setPermSetting] = useState<PermSetting>({
        update_for_all: true,
        extra_update_user_id_list: [],
    });
    const [inEditOther, setInEditOther] = useState(false);
    const [hasChange, setHasChange] = useState(false);


    const { editor, editorRef } = useCommonEditor({
        content: "",
        fsId: projectStore.curProject?.test_case_fs_id ?? "",
        ownerType: FILE_OWNER_TYPE_TEST_CASE,
        ownerId: projectStore.projectModal.testCaseId,
        projectId: projectStore.curProjectId,
        historyInToolbar: false,
        clipboardInToolbar: false,
        commonInToolbar: true,
        enableLink: false,
        widgetInToolbar: false,
        showReminder: false,
        placeholder: "请输入测试方案...",
    });

    const loadDetailInfo = async () => {
        const res = await request(get_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: projectStore.projectModal.testCaseId,
            sprit_id: projectStore.projectModal.testCaseLinkSpritId,
        }));
        setDetailInfo(res.case_detail);
        setTestMethod(res.case_detail.case_info.test_method);
    };

    const updateContent = async () => {
        if (editorRef.current == null) {
            return;
        }
        if (detailInfo == null) {
            return;
        }
        const content = editorRef.current.getContent();
        await request(update_case_content({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: detailInfo.case_info.case_id,
            content: JSON.stringify(content),
        }));
        setDetailInfo({
            ...detailInfo,
            content: JSON.stringify(content),
        });
        setInEditContent(false);
    };

    const updateOther = async () => {
        if (detailInfo == null) {
            return;
        }
        await request(update_case({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: detailInfo.case_info.case_id,
            title: detailInfo.case_info.title,
            test_method: testMethod,
        }));
        await request(update_case_perm({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            case_id: detailInfo.case_info.case_id,
            perm_setting: permSetting,
        }));
        setInEditOther(false);
        setHasChange(false);
        setDetailInfo(oldValue => {
            if (oldValue != null) {
                oldValue.case_info.perm_setting = permSetting;
                oldValue.case_info.test_method = testMethod;
            }
            return oldValue;
        })
    };

    useEffect(() => {
        loadDetailInfo();
    }, [projectStore.projectModal.testCaseId]);

    return (
        <div>
            {detailInfo != null && (
                <>
                    <Card title={
                        <>
                            <span style={{ fontSize: "16px", fontWeight: 600 }}>标题:&nbsp;</span>
                            <EditText editable={detailInfo.case_info.user_perm.can_update} content={detailInfo.case_info.title} showEditIcon
                                fontSize="16px" fontWeight={600}
                                onChange={async value => {
                                    if (value.trim() == "") {
                                        return false;
                                    }
                                    try {
                                        await request(update_case({
                                            session_id: userStore.sessionId,
                                            project_id: projectStore.curProjectId,
                                            case_id: detailInfo.case_info.case_id,
                                            title: value.trim(),
                                            test_method: detailInfo.case_info.test_method,
                                        }));
                                        setDetailInfo(oldValue => {
                                            if (oldValue != null) {
                                                oldValue.case_info.title = value.trim();
                                            }
                                            return oldValue;
                                        });
                                        return true;
                                    } catch (e) {
                                        console.log(e);
                                        return false;
                                    }
                                }} />
                        </>
                    }
                        headStyle={{ padding: "0px 10px" }} bordered={false}
                        extra={
                            <Space>
                                {inEditContent == false && detailInfo.case_info.user_perm.can_update && (
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setInEditContent(true);
                                        const t = setInterval(() => {
                                            if (editorRef.current != null) {
                                                editorRef.current.setContent(detailInfo.content);
                                                clearInterval(t);
                                            }
                                        }, 100);
                                    }}>编辑内容</Button>
                                )}
                                {inEditContent == true && (
                                    <>
                                        <Button onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setInEditContent(false);
                                        }}>取消</Button>
                                        <Button type="primary" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateContent();
                                        }}>保存</Button>
                                    </>
                                )}
                            </Space>
                        }>
                        {inEditContent == false && (
                            <div className="_chatContext">
                                <ReadOnlyEditor content={detailInfo.content} />
                            </div>
                        )}
                        {inEditContent == true && (
                            <div className="_chatContext">
                                {editor}
                            </div>
                        )}
                    </Card>
                    <Card title={<span style={{ fontSize: "16px", fontWeight: 600 }}>其他配置</span>} headStyle={{ padding: "0px 10px" }} bordered={false}
                        extra={
                            <Space>
                                {inEditOther == false && detailInfo.case_info.user_perm.can_update && (
                                    <Button type="primary" onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setInEditOther(true);
                                        setTestMethod(detailInfo.case_info.test_method);
                                        setPermSetting(detailInfo.case_info.perm_setting);
                                        setHasChange(false);
                                    }}>编辑</Button>
                                )}
                                {inEditOther == true && (
                                    <>
                                        <Button onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setInEditOther(true);
                                            setTestMethod(detailInfo.case_info.test_method);
                                            setPermSetting(detailInfo.case_info.perm_setting);
                                            setHasChange(false);
                                        }}>取消</Button>
                                        <Button type="primary" onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            updateOther();
                                        }} disabled={!hasChange}>保存</Button>
                                    </>
                                )}
                            </Space>
                        }>
                        <Form disabled={!(inEditOther && detailInfo.case_info.user_perm.can_update)} labelCol={{ span: 3 }}>
                            <Form.Item label="全体可编辑">
                                <Checkbox checked={permSetting.update_for_all} onChange={e => {
                                    e.stopPropagation();
                                    setPermSetting({
                                        ...permSetting,
                                        update_for_all: e.target.checked,
                                    });
                                    setHasChange(true);
                                }} />
                            </Form.Item>
                            {permSetting.update_for_all == false && (
                                <Form.Item label="可编辑成员">
                                    <Select mode="multiple" value={permSetting.extra_update_user_id_list}
                                        onChange={value => {
                                            setPermSetting({
                                                ...permSetting,
                                                extra_update_user_id_list: value,
                                            });
                                            setHasChange(true);
                                        }}>
                                        {memberStore.memberList.map(item => (
                                            <Select.Option key={item.member.member_user_id} value={item.member.member_user_id}>
                                                <Space>
                                                    <UserPhoto logoUri={item.member.logo_uri} style={{ width: "16px", borderRadius: "10px" }} />
                                                    {item.member.display_name}
                                                </Space>
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                            <Form.Item label="测试类型">
                                <Space>
                                    <Checkbox checked={testMethod.unit_test} onChange={e => {
                                        e.stopPropagation();
                                        setTestMethod({
                                            ...testMethod,
                                            unit_test: e.target.checked,
                                        });
                                        setHasChange(true);
                                    }}>单元测试</Checkbox>
                                    <Checkbox checked={testMethod.ci_test} onChange={e => {
                                        e.stopPropagation();
                                        setTestMethod({
                                            ...testMethod,
                                            ci_test: e.target.checked,
                                        });
                                        setHasChange(true);
                                    }}>集成测试</Checkbox>
                                    <Checkbox checked={testMethod.load_test} onChange={e => {
                                        e.stopPropagation();
                                        setTestMethod({
                                            ...testMethod,
                                            load_test: e.target.checked,
                                        });
                                        setHasChange(true);
                                    }}>压力测试</Checkbox>
                                    <Checkbox checked={testMethod.manual_test} onChange={e => {
                                        e.stopPropagation();
                                        setTestMethod({
                                            ...testMethod,
                                            manual_test: e.target.checked,
                                        });
                                        setHasChange(true);
                                    }}>手动测试</Checkbox>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </>
            )}
        </div>
    );
};

export default observer(DetailPanel);