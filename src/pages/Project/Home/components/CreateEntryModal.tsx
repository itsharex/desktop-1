//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import { Button, Card, Checkbox, DatePicker, Form, Input, Modal, Progress, Radio, Select, Tag, message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { create_doc } from "@/api/project_doc";
import { create as create_sprit } from "@/api/project_sprit";
import {
    ENTRY_TYPE_API_COLL, ENTRY_TYPE_BOARD, ENTRY_TYPE_DOC, ENTRY_TYPE_FILE, ENTRY_TYPE_PAGES,
    ENTRY_TYPE_SPRIT, ISSUE_LIST_ALL, ISSUE_LIST_KANBAN, ISSUE_LIST_LIST,
    API_COLL_GRPC, API_COLL_OPENAPI, API_COLL_CUSTOM,
    create as create_entry,
    ENTRY_TYPE_DATA_ANNO,
    ANNO_PROJECT_AUDIO_CLASSIFI,
    ANNO_PROJECT_AUDIO_SEG,
    ANNO_PROJECT_AUDIO_TRANS,
    ANNO_PROJECT_AUDIO_SEG_TRANS,
    ANNO_PROJECT_IMAGE_CLASSIFI,
    ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT,
    ANNO_PROJECT_IMAGE_BRUSH_SEG,
    ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT,
    ANNO_PROJECT_IMAGE_KEYPOINT,
    ANNO_PROJECT_IMAGE_POLYGON_SEG,
    ANNO_PROJECT_TEXT_CLASSIFI,
    ANNO_PROJECT_TEXT_NER,
    ANNO_PROJECT_TEXT_SUMMARY,
} from "@/api/project_entry";
import { useStores } from "@/hooks";
import type { EntryPerm, ExtraSpritInfo, CreateRequest, ExtraFileInfo } from "@/api/project_entry";
import UserPhoto from "@/components/Portrait/UserPhoto";
import moment, { type Moment } from "moment";
import s from "./UpdateEntryModal.module.less";
import { request } from "@/utils/request";
import { APP_PROJECT_KB_BOARD_PATH, APP_PROJECT_KB_DOC_PATH, APP_PROJECT_WORK_PLAN_PATH } from "@/utils/constant";
import { useHistory } from "react-router-dom";
import { DeleteOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { open as open_dialog } from '@tauri-apps/api/dialog';
import { pack_min_app } from "@/api/min_app";
import { uniqId } from "@/utils/utils";
import { FILE_OWNER_TYPE_PAGES, set_file_owner, write_file, get_file_name, make_tmp_dir, FILE_OWNER_TYPE_FILE, FILE_OWNER_TYPE_API_COLLECTION } from "@/api/fs";
import { listen } from '@tauri-apps/api/event';
import type { FsProgressEvent } from '@/api/fs';
import { nanoid } from 'nanoid';
import { create_rpc, create_open_api } from "@/api/api_collection";
import { create_custom } from "@/api/http_custom";
import { Command } from "@tauri-apps/api/shell";
import { create as create_data_anno } from "@/api/data_anno_project";
import { getDefaultConfig } from "@/pages/DataAnno/components/defaultConfig";

interface PathWrap {
    id: string;
    path: string;
}

const CreateEntryModal = () => {
    const history = useHistory();

    const appStore = useStores('appStore');
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const memberStore = useStores('memberStore');
    const docStore = useStores('docStore');
    const boardStore = useStores('boardStore');

    const [title, setTitle] = useState("");
    const [entryPerm, setEntryPerm] = useState<EntryPerm>({
        update_for_all: true,
        extra_update_user_id_list: [],
    });
    const [tagIdList, setTagIdList] = useState<string[]>([]);
    const [spritExtraInfo, setSpritExtraInfo] = useState<ExtraSpritInfo>({
        start_time: moment().startOf("day").valueOf(),
        end_time: moment().add(7, "days").endOf("day").valueOf(),
        non_work_day_list: [],
        issue_list_type: ISSUE_LIST_ALL,
        hide_gantt_panel: false,
        hide_burndown_panel: false,
        hide_stat_panel: false,
        hide_summary_panel: false,
        hide_test_plan_panel: false,
    });

    const [localPagesPath, setLocalPagesPath] = useState("");
    const [uploadPagesTraceId, setUploadPagesTraceId] = useState("");
    const [packFileName, setPackFileName] = useState("");
    const [uploadRatio, setUploadRatio] = useState(0);

    const [localFilePath, setLocalFilePath] = useState("");
    const [uploadFileTraceId, setUploadFileTraceId] = useState("");

    //接口集合相关字段
    const [apiCollType, setApiCollType] = useState(API_COLL_GRPC);
    const [defaultAddr, setDefaultAddr] = useState("");

    const [grpcRootPath, setGrpcRootPath] = useState("");
    const [grpcImportPathList, setGrpcImportPathList] = useState<PathWrap[]>([]);
    const [grpcSecure, setGrpcSecure] = useState(false);

    const [openApiPath, setOpenApiPath] = useState("");
    const [openApiProtocol, setOpenApiProtocol] = useState("http");

    const [customProtocol, setCustomProtocol] = useState("https");

    //数据标注相关字段
    const [annoType, setAnnoType] = useState(ANNO_PROJECT_AUDIO_CLASSIFI);
    const [annoDesc, setAnnoDesc] = useState("");

    const checkDayValid = (day: Moment): boolean => {
        const startTime = spritExtraInfo.start_time;
        const endTime = spritExtraInfo.end_time;
        const dayTime = day.valueOf();
        return dayTime >= startTime && dayTime <= endTime;
    };

    const choicePagesPath = async () => {
        const selected = await open_dialog({
            title: "打开本地应用目录",
            directory: true,
        });
        if (selected == null || Array.isArray(selected)) {
            return;
        }
        setLocalPagesPath(selected);
    };

    const choiceRootPath = async () => {
        const selected = await open_dialog({
            title: "选择grpc接口定义路径",
            directory: true,
        });
        if ((selected == null) || (Array.isArray(selected))) {
            return;
        }
        setGrpcRootPath(selected);
    };

    const choiceImportPath = async (id: string) => {
        const selected = await open_dialog({
            title: "选择导入路径",
            directory: true,
        });
        if ((selected == null) || (Array.isArray(selected))) {
            return;
        }
        const tmpList = grpcImportPathList.slice();
        const index = tmpList.findIndex(item => item.id == id);
        if (index != -1) {
            tmpList[index].path = selected;
            setGrpcImportPathList(tmpList);
        }
    };

    const choiceOpenApiPath = async () => {
        const selected = await open_dialog({
            title: "选择openapi定义文件",
            filters: [
                {
                    name: "json文件",
                    extensions: ["json"],
                },
                {
                    name: "yaml文件",
                    extensions: ["yml", "yaml"]
                }
            ],
        });
        if ((selected == null) || (Array.isArray(selected))) {
            return;
        }
        setOpenApiPath(selected);
    };

    const choiceFilePath = async () => {
        const selected = await open_dialog({
            title: "选择本地文件",
        });
        if (selected == null || Array.isArray(selected)) {
            return;
        }
        setLocalFilePath(selected);
    };

    const uploadPages = async () => {
        const traceId = uniqId();
        setUploadPagesTraceId(traceId);
        try {
            const path = await pack_min_app(localPagesPath, traceId);
            const res = await request(write_file(userStore.sessionId, projectStore.curProject?.pages_fs_id ?? "", path, traceId));
            return res.file_id;
        } finally {
            setUploadRatio(0);
            setUploadPagesTraceId("");
            setPackFileName("");
        }
    };

    const uploadFile = async (fsId: string): Promise<ExtraFileInfo> => {
        const traceId = uniqId();
        setUploadFileTraceId(traceId);
        try {
            const res = await request(write_file(userStore.sessionId, fsId, localFilePath, traceId));
            const fileName = await get_file_name(localFilePath);
            return {
                file_id: res.file_id,
                file_name: fileName,
            };
        } finally {
            setUploadRatio(0);
            setUploadFileTraceId("");
        }
    }

    const checkValid = () => {
        if (title == "" || packFileName != "" || uploadRatio > 0) {
            return false;
        }
        if (entryStore.createEntryType == ENTRY_TYPE_PAGES) {
            if (localPagesPath == "") {
                return false;
            }
        } else if (entryStore.createEntryType == ENTRY_TYPE_FILE) {
            if (localFilePath == "") {
                return false;
            }
        } else if (entryStore.createEntryType == ENTRY_TYPE_API_COLL) {
            console.log(defaultAddr, grpcRootPath);
            if (defaultAddr == "") {
                return false;
            }
            if (apiCollType == API_COLL_GRPC) {
                if (grpcRootPath == "") {
                    return false;
                }
                if (defaultAddr.includes(":") == false) {
                    return false;
                }
            } else if (apiCollType == API_COLL_OPENAPI) {
                if (openApiPath == "") {
                    return false;
                }
            }
        }
        return true;
    };

    const createEntry = async () => {
        if (title == "" || entryStore.createEntryType == null) {
            return;
        }
        let entryId = "";
        let pagesFileId = "";
        let apiCollFileId = "";
        let extraFileInfo: ExtraFileInfo = {
            file_id: "",
            file_name: "",
        };
        if (entryStore.createEntryType == ENTRY_TYPE_PAGES) {
            pagesFileId = await uploadPages();
            entryId = nanoid(32);
        } else if (entryStore.createEntryType == ENTRY_TYPE_SPRIT) {
            const res = await request(create_sprit(userStore.sessionId, projectStore.curProjectId));
            entryId = res.sprit_id;
        } else if (entryStore.createEntryType == ENTRY_TYPE_DOC) {
            const res = await request(create_doc({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                base_info: {
                    content: JSON.stringify({ type: "doc" }),
                },
            }));
            entryId = res.doc_id;
        } else if (entryStore.createEntryType == ENTRY_TYPE_BOARD) {
            entryId = nanoid(32);
        } else if (entryStore.createEntryType == ENTRY_TYPE_FILE) {
            extraFileInfo = await uploadFile(projectStore.curProject?.file_fs_id ?? "");
            entryId = nanoid(32);
        } else if (entryStore.createEntryType == ENTRY_TYPE_API_COLL) {
            if (apiCollType == API_COLL_GRPC) {
                const tmpDir = await make_tmp_dir();
                let tmpFile = `${tmpDir}/grpc.data`;
                if (appStore.isOsWindows) {
                    tmpFile = `${tmpDir}\\grpc.data`;
                }
                const args: string[] = ["parse", "--rootPath", grpcRootPath, "--outPath", tmpFile];
                for (const importPath of grpcImportPathList) {
                    args.push("--importPath");
                    args.push(importPath.path);
                }
                const cmd = Command.sidecar("bin/grpcutil", args);
                const output = await cmd.execute();
                const result = JSON.parse(output.stdout);
                if (result.error != undefined) {
                    message.error(`无法编译grpc协议文件。${result.error}`)
                    return;
                }
                //上传文件
                const upRes = await request(write_file(userStore.sessionId, projectStore.curProject?.api_coll_fs_id ?? "", tmpFile, ""));
                apiCollFileId = upRes.file_id;
                const res = await request(create_rpc({
                    session_id: userStore.sessionId,
                    project_id: projectStore.curProjectId,
                    default_addr: defaultAddr,
                    proto_file_id: upRes.file_id,
                    secure: grpcSecure,
                }));
                entryId = res.api_coll_id;
            } else if (apiCollType == API_COLL_OPENAPI) {
                //上传文件
                const upRes = await request(write_file(userStore.sessionId, projectStore.curProject?.api_coll_fs_id ?? "", openApiPath, ""));
                apiCollFileId = upRes.file_id;
                //创建api
                const res = await request(create_open_api({
                    session_id: userStore.sessionId,
                    project_id: projectStore.curProjectId,
                    default_addr: defaultAddr,
                    proto_file_id: upRes.file_id,
                    net_protocol: openApiProtocol,
                }));
                entryId = res.api_coll_id;
            } else if (apiCollType == API_COLL_CUSTOM) {
                const res = await request(create_custom({
                    session_id: userStore.sessionId,
                    project_id: projectStore.curProjectId,
                    default_addr: defaultAddr,
                    net_protocol: customProtocol,
                }));
                entryId = res.api_coll_id;
            }
        } else if (entryStore.createEntryType == ENTRY_TYPE_DATA_ANNO) {
            const res = await request(create_data_anno({
                session_id: userStore.sessionId,
                project_id: projectStore.curProjectId,
                base_info: {
                    desc: annoDesc,
                    config: getDefaultConfig(annoType),
                },
            }));
            entryId = res.anno_project_id;
        }
        if (entryId == "" || entryStore.createEntryType == null) {
            return;
        }
        const createReq: CreateRequest = {
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: entryId,
            entry_type: entryStore.createEntryType,
            entry_title: title,
            tag_id_list: tagIdList,
            parent_folder_id: entryStore.curFolderId,
            entry_perm: {
                update_for_all: entryPerm.update_for_all,
                extra_update_user_id_list: entryPerm.update_for_all ? [] : entryPerm.extra_update_user_id_list,
            },
        };
        if (entryStore.createEntryType == ENTRY_TYPE_SPRIT) {
            createReq.extra_info = {
                ExtraSpritInfo: spritExtraInfo,
            };
        } else if (entryStore.createEntryType == ENTRY_TYPE_PAGES) {
            createReq.extra_info = {
                ExtraPagesInfo: {
                    file_id: pagesFileId,
                },
            }
        } else if (entryStore.createEntryType == ENTRY_TYPE_FILE) {
            createReq.extra_info = {
                ExtraFileInfo: extraFileInfo,
            }
        } else if (entryStore.createEntryType == ENTRY_TYPE_API_COLL) {
            createReq.extra_info = {
                ExtraApiCollInfo: {
                    api_coll_type: apiCollType,
                    default_addr: defaultAddr,
                },
            };
        } else if (entryStore.createEntryType == ENTRY_TYPE_DATA_ANNO) {
            createReq.extra_info = {
                ExtraDataAnnoInfo: {
                    anno_type: annoType,
                },
            }
        }
        await request(create_entry(createReq));

        await entryStore.loadEntry(entryId);
        if (entryStore.createEntryType == ENTRY_TYPE_SPRIT) {
            history.push(APP_PROJECT_WORK_PLAN_PATH);
        } else if (entryStore.createEntryType == ENTRY_TYPE_DOC) {
            await docStore.loadDoc();
            appStore.inEdit = true;
            history.push(APP_PROJECT_KB_DOC_PATH);
        } else if (entryStore.createEntryType == ENTRY_TYPE_PAGES) {
            await request(set_file_owner({
                session_id: userStore.sessionId,
                fs_id: projectStore.curProject?.pages_fs_id ?? "",
                file_id: pagesFileId,
                owner_type: FILE_OWNER_TYPE_PAGES,
                owner_id: entryId,
            }));
        } else if (entryStore.createEntryType == ENTRY_TYPE_BOARD) {
            boardStore.reset();
            history.push(APP_PROJECT_KB_BOARD_PATH);
        } else if (entryStore.createEntryType == ENTRY_TYPE_FILE) {
            await request(set_file_owner({
                session_id: userStore.sessionId,
                fs_id: projectStore.curProject?.file_fs_id ?? "",
                file_id: extraFileInfo.file_id,
                owner_type: FILE_OWNER_TYPE_FILE,
                owner_id: entryId,
            }));
        } else if (entryStore.createEntryType == ENTRY_TYPE_API_COLL) {
            if (apiCollFileId != "") {
                await request(set_file_owner({
                    session_id: userStore.sessionId,
                    fs_id: projectStore.curProject?.api_coll_fs_id ?? "",
                    file_id: apiCollFileId,
                    owner_type: FILE_OWNER_TYPE_API_COLLECTION,
                    owner_id: entryId,
                }));
            }
        }
        message.info("创建成功");
        entryStore.createEntryType = null;
    };

    useEffect(() => {
        if (uploadPagesTraceId == "") {
            return;
        }
        const unListenFn = listen<FsProgressEvent>("uploadFile_" + uploadPagesTraceId, ev => {
            if (ev.payload.total_step == 0) {
                setUploadRatio(100);
            } else {
                setUploadRatio(Math.round(ev.payload.cur_step * 100 / ev.payload.total_step));
            }
        });

        const unListenFn2 = listen<string>(uploadPagesTraceId, ev => {
            setPackFileName(ev.payload);
        });

        return () => {
            unListenFn.then((unListen) => unListen());
            unListenFn2.then((unListen) => unListen());
        };
    }, [uploadPagesTraceId]);

    useEffect(() => {
        if (uploadFileTraceId == "") {
            return;
        }
        const unListenFn = listen<FsProgressEvent>("uploadFile_" + uploadFileTraceId, ev => {
            if (ev.payload.total_step == 0) {
                setUploadRatio(100);
            } else {
                setUploadRatio(Math.round(ev.payload.cur_step * 100 / ev.payload.total_step));
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, [uploadFileTraceId]);

    return (
        <Modal open title="创建内容"
            bodyStyle={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}
            okText="创建" okButtonProps={{ disabled: checkValid() == false }}
            cancelButtonProps={{ disabled: packFileName != "" || uploadRatio > 0 }}
            closable={!(packFileName != "" || uploadRatio > 0)}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                entryStore.createEntryType = null;
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                createEntry();
            }}>
            <Form labelCol={{ span: 6 }} disabled={packFileName != "" || uploadRatio > 0}>
                <Form.Item label="标题">
                    <Input value={title} onChange={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setTitle(e.target.value.trim());
                    }} />
                </Form.Item>

                <Form.Item label="类型">
                    <Radio.Group value={entryStore.createEntryType} onChange={e => {
                        e.stopPropagation();
                        entryStore.createEntryType = e.target.value;
                    }}>
                        {projectStore.isAdmin && (
                            <Radio value={ENTRY_TYPE_SPRIT}>工作计划</Radio>
                        )}
                        <Radio value={ENTRY_TYPE_DOC}>文档</Radio>
                        <Radio value={ENTRY_TYPE_PAGES}>静态网页</Radio>
                        <Radio value={ENTRY_TYPE_BOARD}>信息面板</Radio>
                        <Radio value={ENTRY_TYPE_FILE}>文件</Radio>
                        <Radio value={ENTRY_TYPE_API_COLL}>接口集合</Radio>
                        <Radio value={ENTRY_TYPE_DATA_ANNO}>数据标注</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item label="所有成员可修改">
                    <Checkbox checked={entryPerm.update_for_all} onChange={e => {
                        e.stopPropagation();
                        setEntryPerm({ ...entryPerm, update_for_all: e.target.checked });
                    }} />
                </Form.Item>
                {entryPerm.update_for_all == false && (
                    <Form.Item label="可修改成员" help="管理员始终具有修改权限">
                        <Checkbox.Group value={entryPerm.extra_update_user_id_list}
                            options={memberStore.memberList.filter(member => member.member.can_admin == false).map(member => (
                                {
                                    label: (<div>
                                        <UserPhoto logoUri={member.member.logo_uri} style={{ width: "16px", borderRadius: "10px", marginRight: "10px" }} />
                                        {member.member.display_name}
                                    </div>),
                                    value: member.member.member_user_id,
                                }
                            ))} onChange={value => {
                                setEntryPerm({ ...entryPerm, extra_update_user_id_list: value as string[] });
                            }} />
                    </Form.Item>
                )}
                <Form.Item label="标签">
                    <Checkbox.Group value={tagIdList} options={(projectStore.curProject?.tag_list ?? []).filter(tag => tag.use_in_entry).map(tag => ({
                        label: <div style={{ backgroundColor: tag.bg_color, padding: "0px 4px", marginBottom: "10px" }}>{tag.tag_name}</div>,
                        value: tag.tag_id,
                    }))} onChange={value => {
                        setTagIdList(value as string[]);
                    }} />
                </Form.Item>
                {entryStore.createEntryType == ENTRY_TYPE_SPRIT && (
                    <>
                        <Form.Item label="时间区间">
                            <DatePicker.RangePicker popupClassName={s.date_picker}
                                allowClear={false}
                                value={[moment(spritExtraInfo.start_time), moment(spritExtraInfo.end_time)]}
                                onChange={value => {
                                    if (value == null) {
                                        return;
                                    }
                                    if ((value[0]?.valueOf() ?? 0) >= (value[1]?.valueOf() ?? 0)) {
                                        return;
                                    }
                                    setSpritExtraInfo({
                                        ...spritExtraInfo,
                                        start_time: value[0]?.startOf("day").valueOf() ?? 0,
                                        end_time: value[1]?.endOf("day").valueOf() ?? 0,
                                    });
                                }} />
                        </Form.Item>
                        <Form.Item label="非工作日">
                            {(spritExtraInfo.non_work_day_list).map(dayTime => (
                                <Tag key={dayTime} style={{ lineHeight: "26px", marginTop: "2px" }}
                                    closable onClose={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const tmpList = (spritExtraInfo.non_work_day_list).filter(item => item != dayTime);
                                        setSpritExtraInfo({
                                            ...spritExtraInfo,
                                            non_work_day_list: tmpList,
                                        });
                                    }}>
                                    {moment(dayTime).format("YYYY-MM-DD")}
                                </Tag>
                            ))}
                            <DatePicker popupClassName={s.date_picker} value={null}
                                disabled={spritExtraInfo.start_time == 0 || spritExtraInfo.end_time == 0}
                                disabledDate={(day) => checkDayValid(day) == false}
                                onChange={value => {
                                    if (value !== null) {
                                        if (checkDayValid(value) == false) {
                                            return;
                                        }
                                        const dayTime = value.startOf("day").valueOf();
                                        if (spritExtraInfo.non_work_day_list.includes(dayTime) == false) {
                                            const tmpList = spritExtraInfo.non_work_day_list.slice();
                                            tmpList.push(dayTime);
                                            tmpList.sort();
                                            setSpritExtraInfo({
                                                ...spritExtraInfo,
                                                non_work_day_list: tmpList,
                                            });
                                        }
                                    }
                                }} />
                        </Form.Item>
                        <Form.Item label="列表样式">
                            <Radio.Group value={spritExtraInfo.issue_list_type} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSpritExtraInfo({
                                    ...spritExtraInfo,
                                    issue_list_type: e.target.value,
                                });
                            }}>
                                <Radio value={ISSUE_LIST_ALL}>列表和看板</Radio>
                                <Radio value={ISSUE_LIST_LIST}>列表</Radio>
                                <Radio value={ISSUE_LIST_KANBAN}>看板</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item label="隐藏甘特图">
                            <Checkbox checked={spritExtraInfo.hide_gantt_panel} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSpritExtraInfo({
                                    ...spritExtraInfo,
                                    hide_gantt_panel: e.target.checked,
                                });
                            }} />
                        </Form.Item>
                        <Form.Item label="隐藏燃尽图">
                            <Checkbox checked={spritExtraInfo.hide_burndown_panel} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSpritExtraInfo({
                                    ...spritExtraInfo,
                                    hide_burndown_panel: e.target.checked,
                                });
                            }} />
                        </Form.Item>
                        <Form.Item label="隐藏统计信息">
                            <Checkbox checked={spritExtraInfo.hide_stat_panel} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSpritExtraInfo({
                                    ...spritExtraInfo,
                                    hide_stat_panel: e.target.checked,
                                });
                            }} />
                        </Form.Item>
                        <Form.Item label="隐藏测试计划">
                            <Checkbox checked={spritExtraInfo.hide_test_plan_panel} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSpritExtraInfo({
                                    ...spritExtraInfo,
                                    hide_test_plan_panel: e.target.checked,
                                });
                            }} />
                        </Form.Item>
                        <Form.Item label="隐藏工作总结">
                            <Checkbox checked={spritExtraInfo.hide_summary_panel} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSpritExtraInfo({
                                    ...spritExtraInfo,
                                    hide_summary_panel: e.target.checked,
                                });
                            }} />
                        </Form.Item>
                    </>
                )}
                {entryStore.createEntryType == ENTRY_TYPE_PAGES && (
                    <>
                        <Form.Item label="网页目录" help="目录中需包含index.html">
                            <Input value={localPagesPath} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setLocalPagesPath(e.target.value);
                            }}
                                addonAfter={<Button type="link" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    choicePagesPath();
                                }} />} />
                        </Form.Item>
                        {uploadRatio == 0 && packFileName != "" && (
                            <Form.Item label="打包进度">
                                {packFileName}
                            </Form.Item>
                        )}
                        {uploadRatio > 0 && (
                            <Form.Item label="上传进度">
                                <Progress percent={uploadRatio} />
                            </Form.Item>
                        )}
                    </>
                )}
                {entryStore.createEntryType == ENTRY_TYPE_FILE && (
                    <>
                        <Form.Item label="本地文件">
                            <Input value={localFilePath} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setLocalFilePath(e.target.value);
                            }}
                                addonAfter={<Button type="link" style={{ height: 20 }} icon={<FolderOpenOutlined />} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    choiceFilePath();
                                }} />} />
                        </Form.Item>
                        {uploadRatio > 0 && (
                            <Form.Item label="上传进度">
                                <Progress percent={uploadRatio} />
                            </Form.Item>
                        )}
                    </>
                )}
                {entryStore.createEntryType == ENTRY_TYPE_API_COLL && (
                    <>
                        <Form.Item label="接口类型">
                            <Select value={apiCollType} onChange={value => setApiCollType(value)}>
                                <Select.Option value={API_COLL_GRPC}>GRPC接口</Select.Option>
                                <Select.Option value={API_COLL_OPENAPI}>OPENAPI接口</Select.Option>
                                <Select.Option value={API_COLL_CUSTOM}>自定义接口</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="服务地址" help={
                            <>
                                {apiCollType == API_COLL_GRPC && defaultAddr !== "" && defaultAddr.split(":").length != 2 && (
                                    <span style={{ color: "red" }}>请输入 地址:端口</span>
                                )}
                            </>
                        }>
                            <Input value={defaultAddr} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setDefaultAddr(e.target.value.trim());
                            }} />
                        </Form.Item>
                        {apiCollType == API_COLL_GRPC && (
                            <>
                                <Form.Item label="grpc路径">
                                    <Input addonAfter={<Button type="text" style={{ height: "20px", minWidth: 0, padding: "0px 0px" }} icon={<FolderOpenOutlined />} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        choiceRootPath();
                                    }} />} value={grpcRootPath} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setGrpcRootPath(e.target.value);
                                    }} />
                                </Form.Item>
                                <Form.Item label="安全模式(tls)">
                                    <Checkbox checked={grpcSecure} onChange={e => {
                                        e.stopPropagation();
                                        setGrpcSecure(e.target.checked);
                                    }} />
                                </Form.Item>
                            </>
                        )}
                        {apiCollType == API_COLL_OPENAPI && (
                            <>
                                <Form.Item label="openapi文件路径">
                                    <Input addonAfter={<Button type="text" style={{ height: "20px", minWidth: 0, padding: "0px 0px" }} icon={<FolderOpenOutlined />} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        choiceOpenApiPath();
                                    }} />} value={openApiPath} onChange={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setOpenApiPath(e.target.value);
                                    }} />
                                </Form.Item>
                                <Form.Item label="网络协议">
                                    <Select value={openApiProtocol} onChange={value => setOpenApiProtocol(value)}>
                                        <Select.Option value="http">http</Select.Option>
                                        <Select.Option value="https">https</Select.Option>
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                        {apiCollType == API_COLL_CUSTOM && (
                            <Form.Item label="网络协议">
                                <Select value={customProtocol} onChange={value => setCustomProtocol(value)}>
                                    <Select.Option value="http">http</Select.Option>
                                    <Select.Option value="https">https</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                    </>
                )}

                {entryStore.createEntryType == ENTRY_TYPE_DATA_ANNO && (
                    <>
                        <Form.Item label="标注类型">
                            <Select value={annoType} onChange={value => setAnnoType(value)}>
                                <Select.Option value={ANNO_PROJECT_AUDIO_CLASSIFI}>音频分类</Select.Option>
                                <Select.Option value={ANNO_PROJECT_AUDIO_SEG}>音频分割</Select.Option>
                                <Select.Option value={ANNO_PROJECT_AUDIO_TRANS}>音频翻译</Select.Option>
                                <Select.Option value={ANNO_PROJECT_AUDIO_SEG_TRANS}>音频分段翻译</Select.Option>
                                <Select.Option value={ANNO_PROJECT_IMAGE_CLASSIFI}>图像分类</Select.Option>
                                <Select.Option value={ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT}>矩形对象检测</Select.Option>
                                <Select.Option value={ANNO_PROJECT_IMAGE_BRUSH_SEG}>画笔分割</Select.Option>
                                <Select.Option value={ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT}>圆形对象检测</Select.Option>
                                <Select.Option value={ANNO_PROJECT_IMAGE_KEYPOINT}>图像关键点</Select.Option>
                                <Select.Option value={ANNO_PROJECT_IMAGE_POLYGON_SEG}>多边形分割</Select.Option>
                                <Select.Option value={ANNO_PROJECT_TEXT_CLASSIFI}>文本分类</Select.Option>
                                <Select.Option value={ANNO_PROJECT_TEXT_NER}>文本命名实体识别</Select.Option>
                                <Select.Option value={ANNO_PROJECT_TEXT_SUMMARY}>文本摘要</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="标注描述">
                            <Input.TextArea rows={3} value={annoDesc} onChange={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                setAnnoDesc(e.target.value);
                            }} />
                        </Form.Item>
                    </>
                )}
            </Form>
            {entryStore.createEntryType == ENTRY_TYPE_API_COLL && apiCollType == API_COLL_GRPC && (
                <div>
                    <Card title="导入路径" style={{ border: "none" }} headStyle={{ padding: "0px 0px 0px 20px" }} bodyStyle={{ padding: "10px 0px 0px 0px" }}
                        extra={
                            <Button type="link" onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                const tmpList = grpcImportPathList.slice();
                                tmpList.push({
                                    id: uniqId(),
                                    path: "",
                                });
                                setGrpcImportPathList(tmpList);
                            }}>增加导入路径</Button>
                        }>
                        <Form labelCol={{ span: 5 }}>
                            {grpcImportPathList.map((item, index) => (
                                <Form.Item key={item.id} label={`路径${index + 1}`}>
                                    <div style={{ display: "flex" }}>
                                        <Input addonAfter={<Button type="text" style={{ height: "20px", minWidth: 0, padding: "0px 0px" }} icon={<FolderOpenOutlined />} onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            choiceImportPath(item.id);
                                        }} />} onChange={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = grpcImportPathList.slice();
                                            const itemIndex = tmpList.findIndex(tmpItem => tmpItem.id == item.id);
                                            if (itemIndex != -1) {
                                                tmpList[itemIndex].path = e.target.value.trim();
                                                setGrpcImportPathList(tmpList);
                                            }
                                        }} value={item.path} />
                                        <Button type="text" danger style={{ minWidth: 0, padding: "0px 0px", marginLeft: "10px" }} icon={<DeleteOutlined />} onClick={e => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            const tmpList = grpcImportPathList.filter(tmpItem => tmpItem.id != item.id);
                                            setGrpcImportPathList(tmpList);
                                        }} />
                                    </div>
                                </Form.Item>
                            ))}
                        </Form>
                    </Card>
                </div>
            )}
        </Modal>
    );
};

export default observer(CreateEntryModal);