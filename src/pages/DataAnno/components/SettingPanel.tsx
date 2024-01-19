import React, { useEffect, useRef, useState } from "react";
import * as dataAnnoPrjApi from "@/api/data_anno_project";
import { Button, Card, Descriptions, Space, message } from "antd";
import { EditText } from "@/components/EditCell/EditText";
import { EditTextArea } from "@/components/EditCell/EditTextArea";
import { request } from "@/utils/request";
import { get_session } from "@/api/user";
import { appWindow } from '@tauri-apps/api/window';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { EditOutlined, SaveOutlined, UndoOutlined } from "@ant-design/icons";
import type { EntryInfo } from "@/api/project_entry";
import { ANNO_PROJECT_AUDIO_CLASSIFI, ANNO_PROJECT_AUDIO_SEG, ANNO_PROJECT_AUDIO_SEG_TRANS, ANNO_PROJECT_AUDIO_TRANS, ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT, ANNO_PROJECT_IMAGE_BRUSH_SEG, ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT, ANNO_PROJECT_IMAGE_CLASSIFI, ANNO_PROJECT_IMAGE_KEYPOINT, ANNO_PROJECT_IMAGE_POLYGON_SEG, ANNO_PROJECT_TEXT_CLASSIFI, ANNO_PROJECT_TEXT_NER, ANNO_PROJECT_TEXT_SUMMARY, update_title } from "@/api/project_entry";
import { list_member, type MemberInfo } from "@/api/project_member";
import UserPhoto from "@/components/Portrait/UserPhoto";
import UpdatePermModal from "./UpdatePermModal";

export interface SettingPanelProps {
    projectId: string;
    entryInfo: EntryInfo;
    annoProjectInfo: dataAnnoPrjApi.AnnoProjectInfo;
    admin: boolean;
    onChange: () => void;
}

const SettingPanel = (props: SettingPanelProps) => {
    const [config, setConfig] = useState(props.annoProjectInfo.base_info.config);
    const [inEditConfig, setInEditConfig] = useState(false);
    const [memberInfoList, setMemberInfoList] = useState<MemberInfo[]>([]);
    const [showPermModal, setShowPermModal] = useState(false);


    const editorRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<any>(null);

    const initEditor = () => {
        setInstance((oldValue: any) => {
            if (oldValue != null) {
                return oldValue;
            }
            // @ts-ignore
            return new LabelStudio(editorRef.current, {
                config,
                interfaces: [
                    "panel",
                    "update",
                    "submit",
                    "controls",
                    "side-column",
                    "annotations:menu",
                    "annotations:add-new",
                    "annotations:delete",
                    "predictions:menu",
                ],

                task: {
                    annotations: [],
                    predictions: [],
                    data: {
                        text: "凌鲨是专注于软件研发团队的效率工具。",
                        image: "/annoDemo/demo.jpg",
                        audio: "/annoDemo/demo.wav",
                    }
                },
                onLabelStudioLoad: function (LS: any) {
                    const c = LS.annotationStore.addAnnotation({
                        userGenerate: true
                    });
                    LS.annotationStore.selectAnnotation(c.id);
                },
            });
        });
    };

    const loadMemberInfoList = async () => {
        const sessionId = await get_session();
        const res = await request(list_member(sessionId, props.projectId, false, []));
        setMemberInfoList(res.member_list);
    };

    const saveConfig = async () => {
        const sessionId = await get_session();
        await request(dataAnnoPrjApi.update({
            session_id: sessionId,
            project_id: props.projectId,
            anno_project_id: props.annoProjectInfo.anno_project_id,
            base_info: { ...props.annoProjectInfo.base_info, config },
        }));
        setInEditConfig(false);
        props.onChange();
    };

    useEffect(() => {
        setConfig(props.annoProjectInfo.base_info.config);
    }, [props.annoProjectInfo.base_info.config])


    useEffect(() => {
        if (editorRef.current == null) {
            return;
        }
        initEditor();
        return () => {
            setInstance((oldValue: any) => {
                if (oldValue !== null) {
                    oldValue.destroy();
                }
                return null;
            })
        };
    }, [editorRef]);

    useEffect(() => {
        if (instance != null) {
            instance.destroy();
            setInstance(null);
        }
        initEditor();
    }, [config]);

    useEffect(() => {
        loadMemberInfoList();
    }, []);

    return (
        <div>
            <Descriptions column={1}
                labelStyle={{ width: "120px", textAlign: "right", display: "block" }}
                contentStyle={{ width: "100%", display: "block" }}>
                <Descriptions.Item label="标注项目名称">
                    <EditText editable={props.admin} content={props.entryInfo.entry_title}
                        onChange={async (value) => {
                            if (value.trim() == "") {
                                return false;
                            }
                            const sessionId = await get_session();
                            try {
                                await request(update_title({
                                    session_id: sessionId,
                                    project_id: props.projectId,
                                    entry_id: props.annoProjectInfo.anno_project_id,
                                    title: value.trim(),
                                }));
                                await appWindow.setTitle(`标注项目(${value.trim()})`);
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                            props.onChange();
                            return true;
                        }} showEditIcon />
                </Descriptions.Item>
                <Descriptions.Item label="标注类型">
                    <>
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_CLASSIFI && "音频分类"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG && "音频分割"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_TRANS && "音频翻译"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG_TRANS && "音频分段翻译"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CLASSIFI && "图像分类"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT && "矩形对象检测"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BRUSH_SEG && "画笔分割"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT && "圆形对象检测"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_KEYPOINT && "图像关键点"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_POLYGON_SEG && "多边形分割"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_CLASSIFI && "文本分类"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_NER && "文本命名实体识别"}
                        {props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_SUMMARY && "文本摘要"}
                    </>
                </Descriptions.Item>
                <Descriptions.Item label="修改权限" contentStyle={{ display: "flex", alignItems: "center" }}>
                    {props.entryInfo.entry_perm.update_for_all == true && "全体成员可修改"}
                    {props.entryInfo.entry_perm.update_for_all == false && (
                        <>
                            {memberInfoList.filter(item => props.entryInfo.entry_perm.extra_update_user_id_list.includes(item.member_user_id)).map(item => (
                                <div key={item.member_user_id} style={{ marginBottom: "4px", marginRight: "10px" }}>
                                    <UserPhoto logoUri={item.logo_uri ?? ""} style={{ width: "16px", borderRadius: "10px" }} />
                                    &nbsp;
                                    {item.display_name ?? ""}
                                </div>
                            ))}
                        </>
                    )}
                    <Button type="link" icon={<EditOutlined />} style={{ lineHeight: "20px" }} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowPermModal(true);
                    }} />
                </Descriptions.Item>
                <Descriptions.Item label="标注项目描述">
                    <EditTextArea editable={props.admin} content={props.annoProjectInfo.base_info.desc}
                        onChange={async (value) => {
                            const sessionId = await get_session();
                            try {
                                await request(dataAnnoPrjApi.update({
                                    session_id: sessionId,
                                    project_id: props.projectId,
                                    anno_project_id: props.annoProjectInfo.anno_project_id,
                                    base_info: { ...props.annoProjectInfo.base_info, desc: value.trim() },
                                }));
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                            props.onChange();
                            return true;
                        }} showEditIcon />
                </Descriptions.Item>
                <Descriptions.Item label="AI标注地址">
                    <EditText editable={props.admin} content={props.annoProjectInfo.base_info.predict_url}
                        onChange={async (value) => {
                            if (value.trim() != "") {
                                if (!(value.startsWith("http://") || value.startsWith("https"))) {
                                    message.info("标注地址必须以http://或https://开头");
                                    return false;
                                }
                            }
                            const sessionId = await get_session();
                            try {
                                await request(dataAnnoPrjApi.update({
                                    session_id: sessionId,
                                    project_id: props.projectId,
                                    anno_project_id: props.annoProjectInfo.anno_project_id,
                                    base_info: { ...props.annoProjectInfo.base_info, predict_url: value.trim() },
                                }));
                            } catch (e) {
                                console.log(e);
                                return false;
                            }
                            props.onChange();
                            return true;
                        }} showEditIcon />
                </Descriptions.Item>
            </Descriptions>
            <div style={{ display: "flex" }}>
                <Card title="配置" bordered={false} style={{ flex: 1 }} extra={
                    <>
                        {inEditConfig == false && (
                            <Button type="primary" icon={<EditOutlined />} onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setInEditConfig(true);
                            }}>修改</Button>
                        )}
                        {inEditConfig == true && (
                            <Space size="middle">
                                <Button icon={<UndoOutlined />} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setConfig(props.annoProjectInfo.base_info.config);
                                    setInEditConfig(false);
                                }}>取消</Button>
                                <Button type="primary" icon={<SaveOutlined />} disabled={props.annoProjectInfo.base_info.config == config}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        saveConfig();
                                    }}>保存</Button>
                            </Space>
                        )}
                    </>
                }>
                    <CodeEditor
                        value={config}
                        language="xml"
                        placeholder="请输入代码"
                        readOnly={!inEditConfig}
                        onChange={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setConfig(e.target.value);
                        }}
                        style={{
                            fontSize: 14,
                            backgroundColor: '#f5f5f5',
                            height: "calc(100vh - 380px)",
                            overflowY: "scroll",
                        }}
                    />
                </Card>
                <div style={{ flex: 2, marginLeft: "20px" }} ref={editorRef} />
            </div>
            {showPermModal == true && (
                <UpdatePermModal projectId={props.projectId} entryPerm={props.entryInfo.entry_perm}
                    annoProjectId={props.annoProjectInfo.anno_project_id}
                    onCancel={() => setShowPermModal(false)}
                    onOk={() => {
                        props.onChange();
                        setShowPermModal(false);
                    }} />
            )}
        </div>
    )
};

export default SettingPanel;