//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import React, { useEffect, useRef, useState } from "react";
import * as dataAnnoTaskApi from "@/api/data_anno_task";
import { request } from "@/utils/request";
import { get_session } from "@/api/user";
import { Button, Card, Modal, Popover, Space } from "antd";
import type { ANNO_PROJECT_TYPE } from "@/api/project_entry";
import { isAnnoText, isAnnoAudio, isAnnoImage } from "@/api/data_anno_project";
import { MoreOutlined } from "@ant-design/icons";
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useSize } from "ahooks";

export interface AnnoPanelProps {
    projectId: string;
    annoProjectId: string;
    annoType: ANNO_PROJECT_TYPE;
    config: string;
    fsId: string;
    memberUserId?: string;
    done: boolean;
    onChange: () => void;
    setInstance: (value: any) => void;
}

const AnnoPanel = (props: AnnoPanelProps) => {
    const winSize = useSize(window.document.body);

    const [taskList, setTaskList] = useState<dataAnnoTaskApi.TaskInfo[]>([]);
    const [taskIndex, setTaskIndex] = useState(0);
    const [taskResult, setTaskResult] = useState("[]");
    const editorRef = useRef<HTMLDivElement>(null);
    const [instance, setInstance] = useState<any>(null);
    const [hasChange, setHasChange] = useState(false);

    const [taskDraft, setTaskDraft] = useState("[]");
    const [showResultModal, setShowResultModal] = useState(false);

    const loadTaskList = async () => {
        const sessionId = await get_session();
        const res = await request(dataAnnoTaskApi.list_task({
            session_id: sessionId,
            project_id: props.projectId,
            anno_project_id: props.annoProjectId,
            member_user_id: props.memberUserId ?? "",
            filter_by_done: true,
            done: props.done,
        }));
        setTaskList(res.info_list);
        if ((res.info_list.length > 0) && (taskIndex > (res.info_list.length - 1))) {
            setTaskIndex(res.info_list.length - 1);
        }
    };

    const saveResult = async (result: string) => {
        const sessionId = await get_session();
        setTaskResult(result);
        await request(dataAnnoTaskApi.set_result({
            session_id: sessionId,
            project_id: props.projectId,
            result: {
                anno_project_id: props.annoProjectId,
                member_user_id: props.memberUserId ?? "",
                resource_id: taskList[taskIndex % taskList.length].resource_id,
                result: result,
            },
        }));
        setHasChange(false);
    };

    const getResultData = () => {
        try {
            const obj = JSON.parse(taskResult);
            if (Array.isArray(obj)) {
                if (obj.length == 1) {
                    return obj[0].result ?? [];
                }
            }
        } catch (e) {
            console.log(e, taskResult);
            return [];
        }
        return [];
    }

    const setDone = async (done: boolean) => {
        if (taskList.length == 0) {
            return;
        }
        const sessionId = await get_session();
        const resourceId = taskList[taskIndex % taskList.length].resource_id;
        await request(dataAnnoTaskApi.set_result_state({
            session_id: sessionId,
            project_id: props.projectId,
            anno_project_id: props.annoProjectId,
            member_user_id: props.memberUserId ?? "",
            resource_id: resourceId,
            done: done,
        }));
        const tmpList = taskList.filter(item => item.resource_id != resourceId);
        if (tmpList.length > 0 && taskIndex >= tmpList.length) {
            setTaskIndex(tmpList.length - 1);
        }
        setTaskList(tmpList);
        props.onChange();
    };

    const initEditor = async (task: any, tmpResult: string = "") => {
        //加载已标注结果
        const sessionId = await get_session();
        if (tmpResult == "") {
            const res = await request(dataAnnoTaskApi.get_result({
                session_id: sessionId,
                project_id: props.projectId,
                anno_project_id: props.annoProjectId,
                member_user_id: props.memberUserId ?? "",
                resource_id: taskList[taskIndex % taskList.length].resource_id,
            }));
            try {
                task.annotations = JSON.parse(res.result.result).map((item: any) => {
                    item.readonly = props.done;
                    return item;
                });
                if (Array.isArray(task.annotations)) {
                    if (task.annotations.length == 1) {
                        if (task.annotations[0].result !== undefined) {
                            setTaskDraft(JSON.stringify(task.annotations[0].result, null, 2));
                        } else {
                            setTaskDraft("[]");
                        }
                    }
                }
            } catch (e) {
                console.log(e, res.result.result);
                setTaskDraft("[]");
            }
            setTaskResult(res.result.result);
        } else {
            try {
                task.annotations = [
                    {
                        "readonly": props.done,
                        "result": JSON.parse(tmpResult),
                    }
                ];

                setTaskDraft(tmpResult);
                setTaskResult(tmpResult);
            } catch (e) {
                console.log(e, tmpResult);
                setTaskDraft("[]");
                setTaskResult("[]");
            }
        }
        setInstance((oldValue: any) => {
            if (oldValue != null) {
                return oldValue;
            }
            // @ts-ignore
            const newInstance = new LabelStudio(editorRef.current, {
                config: props.config,
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

                task,
                onLabelStudioLoad: function (LS: any) {
                    const c = LS.annotationStore.addAnnotation({
                        userGenerate: true
                    });
                    LS.annotationStore.selectAnnotation(c.id);
                    console.log(LS);
                },
                onSubmitAnnotation: function (_: any, annotation: any) {
                    const resultList = annotation.serializeAnnotation();
                    saveResult(JSON.stringify([{ "result": resultList }]));
                },
                onEntityCreate: function () {
                    setHasChange(true);
                },
                onEntityDelete: function () {
                    setHasChange(true);
                },
                onSubmitDraft: function (_: any, annotation: any) {
                    const resultList = annotation.serializeAnnotation();
                    setTaskDraft(JSON.stringify([{ "result": resultList }], null, 2));
                    setHasChange(true);
                }
            });
            props.setInstance(newInstance);
            return newInstance;
        });
    };

    const getUrl = () => {
        const isOsWindows = navigator.userAgent.toLowerCase().indexOf("windows") > -1;
        if (isOsWindows) {
            return `https://fs.localhost/${props.fsId}/${taskList[(taskIndex) % taskList.length].content}/resource`;
        } else {
            return `fs://localhost/${props.fsId}/${taskList[(taskIndex) % taskList.length].content}/resource`;
        }
    }

    useEffect(() => {
        loadTaskList();
    }, [])

    useEffect(() => {
        if (editorRef.current == null || taskList.length == 0) {
            return;
        }
        if (hasChange) {
            return;
        }
        initEditor({
            annotations: [],
            predictions: [],
            data: {
                image: isAnnoImage(props.annoType) ? getUrl() : "",
                audio: isAnnoAudio(props.annoType) ? getUrl() : "",
                text: isAnnoText(props.annoType) ? taskList[(taskIndex) % taskList.length].content : "",
            }
        });
        return () => {
            setHasChange(oldChange => {
                if (!oldChange) {
                    setInstance((oldValue: any) => {
                        if (oldValue !== null) {
                            oldValue.destroy();
                        }
                        return null;
                    });
                }
                return oldChange;
            });
        };
    }, [editorRef.current, taskList, taskIndex, winSize]);

    return (
        <Card bordered={false} extra={
            <Space size="middle">
                <span>{taskIndex + 1}/{taskList.length}</span>
                <Button type="link" disabled={(taskIndex <= 0) || hasChange} style={{ minWidth: 0, padding: "0px 0px" }}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTaskResult("");
                        setTaskIndex(oldValue => {
                            if (oldValue > 0) {
                                return oldValue - 1;
                            }
                            return 0;
                        });
                    }}>上一个</Button>
                <Button type="link" disabled={(taskIndex >= (taskList.length - 1)) || hasChange} style={{ minWidth: 0, padding: "0px 0px" }}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTaskIndex(oldValue => {
                            return (oldValue + 1) % taskList.length;
                        });
                    }}>下一个</Button>
                {props.done == false && (
                    <>
                        <Button disabled={!hasChange} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (instance != null) {
                                instance.destroy();
                                setInstance(null);
                            }
                            initEditor({
                                annotations: [],
                                predictions: [],
                                data: {
                                    image: isAnnoImage(props.annoType) ? getUrl() : "",
                                    audio: isAnnoAudio(props.annoType) ? getUrl() : "",
                                    text: isAnnoText(props.annoType) ? taskList[(taskIndex) % taskList.length].content : "",
                                }
                            });
                            setHasChange(false);
                        }}>取消</Button>
                        <Button type="primary" disabled={!hasChange} onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (instance !== null) {
                                instance.store.submitAnnotation();
                            }
                        }}>保存</Button>
                    </>
                )}

                {props.done == false && (
                    <Button type="primary" disabled={hasChange} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDone(true);
                    }}>标记成完成</Button>
                )}
                {props.done == true && (
                    <Button type="primary" disabled={hasChange} onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDone(false);
                    }}>标记成未完成</Button>
                )}
                <Popover placement="bottomLeft" trigger="click" content={
                    <Space direction="vertical">
                        <Button type="link" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            setShowResultModal(true);
                        }}>查看标注数据</Button>
                        {props.done == false && getResultData().length > 0 && (
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (taskDraft != "[]") {
                                    setHasChange(true);
                                }
                                if (instance !== null) {
                                    instance.destroy();
                                    setInstance(null);
                                }
                                initEditor({
                                    annotations: [],
                                    predictions: [],
                                    data: {
                                        image: isAnnoImage(props.annoType) ? getUrl() : "",
                                        audio: isAnnoAudio(props.annoType) ? getUrl() : "",
                                        text: isAnnoText(props.annoType) ? taskList[(taskIndex) % taskList.length].content : "",
                                    }
                                }, "[]");
                            }}>清空标注数据</Button>
                        )}
                    </Space>
                }>
                    <MoreOutlined style={{ paddingRight: "22px" }} />
                </Popover>
            </Space>
        }>
            <div ref={editorRef} style={{ height: "100px" }} />
            {showResultModal == true && (
                <Modal open title="标注数据" footer={null} onCancel={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowResultModal(false);
                }}>
                    <CodeEditor
                        value={taskDraft}
                        language="json"
                        disabled
                        style={{
                            fontSize: 14,
                            backgroundColor: '#f5f5f5',
                            maxHeight: "calc(100vh - 300px)",
                            overflowY: "auto"
                        }}
                    />
                </Modal>
            )}
        </Card>
    )
};

export default AnnoPanel;