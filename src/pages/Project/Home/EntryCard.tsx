import React, { useState } from "react";
import { Button, Card, Popover, Space, Tag, message } from "antd";
import { observer } from 'mobx-react';
import type { EntryInfo } from "@/api/project_entry";
import { update_mark_sys, ENTRY_TYPE_SPRIT, ENTRY_TYPE_DOC, ENTRY_TYPE_PAGES, ENTRY_TYPE_BOARD, ENTRY_TYPE_FILE, set_parent_folder, ENTRY_TYPE_API_COLL, ENTRY_TYPE_DATA_ANNO, API_COLL_GRPC, API_COLL_OPENAPI, API_COLL_CUSTOM, ANNO_PROJECT_AUDIO_CLASSIFI, ANNO_PROJECT_AUDIO_SEG, ANNO_PROJECT_AUDIO_TRANS, ANNO_PROJECT_AUDIO_SEG_TRANS, ANNO_PROJECT_IMAGE_CLASSIFI, ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT, ANNO_PROJECT_IMAGE_BRUSH_SEG, ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT, ANNO_PROJECT_IMAGE_KEYPOINT, ANNO_PROJECT_IMAGE_POLYGON_SEG, ANNO_PROJECT_TEXT_CLASSIFI, ANNO_PROJECT_TEXT_NER, ANNO_PROJECT_TEXT_SUMMARY } from "@/api/project_entry";
import s from "./Card.module.less";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import { EditOutlined, InfoCircleOutlined, MoreOutlined } from "@ant-design/icons";
import EntryPopover from "./components/EntryPopover";
import { useHistory } from "react-router-dom";
import { APP_PROJECT_KB_BOARD_PATH, APP_PROJECT_KB_DOC_PATH, APP_PROJECT_WORK_PLAN_PATH } from "@/utils/constant";
import { getEntryTypeStr } from "./components/common";
import RemoveEntryModal from "./components/RemoveEntryModal";
import spritIcon from '@/assets/allIcon/icon-sprit.png';
import htmlIcon from '@/assets/allIcon/icon-html.png';
import boardIcon from '@/assets/allIcon/icon-board.png';
import apiCollIcon from '@/assets/allIcon/icon-apicoll.png';
import dataAnnoIcon from '@/assets/allIcon/icon-dataanno.png';
import docIcon from '@/assets/channel/doc@2x.png';
import PagesModal from "./components/PagesModal";
import FileModal from "./components/FileModal";
import MoveToFolderModal from "./components/MoveToFolderModal";

export interface EntryCardPorps {
    entryInfo: EntryInfo;
    canMove: boolean;
    onMove: () => void;
    onMarkSys: () => void;
}

const EntryCard = (props: EntryCardPorps) => {
    const history = useHistory();

    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const entryStore = useStores('entryStore');
    const docStore = useStores('docStore');
    const boardStore = useStores('boardStore');
    const linkAuxStore = useStores('linkAuxStore');

    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showPagesModal, setShowPagesModal] = useState(false);
    const [showFileModal, setShowFileModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);

    const openEntry = async () => {
        entryStore.reset();
        if (props.entryInfo.entry_type == ENTRY_TYPE_DOC) {
            entryStore.curEntry = props.entryInfo;
            await docStore.loadDoc();
            history.push(APP_PROJECT_KB_DOC_PATH);
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_SPRIT) {
            entryStore.curEntry = props.entryInfo;
            history.push(APP_PROJECT_WORK_PLAN_PATH);
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_PAGES) {
            setShowPagesModal(true);
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_BOARD) {
            entryStore.curEntry = props.entryInfo;
            boardStore.reset();
            history.push(APP_PROJECT_KB_BOARD_PATH);
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_FILE) {
            setShowFileModal(true);
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_API_COLL) {
            linkAuxStore.openApiCollPage(props.entryInfo.entry_id, props.entryInfo.entry_title, props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type ?? 0,
                props.entryInfo.extra_info.ExtraApiCollInfo?.default_addr ?? "", props.entryInfo.can_update, projectStore.isAdmin, false);
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_DATA_ANNO) {
            linkAuxStore.openAnnoProjectPage(props.entryInfo.entry_id, props.entryInfo.entry_title);
        }
    };

    const getBgColor = () => {
        if (props.entryInfo.entry_type == ENTRY_TYPE_DOC) {
            return "lightyellow";
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_SPRIT) {
            return "seashell";
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_PAGES) {
            return "bisque";
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_BOARD) {
            return "gainsboro";
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_FILE) {
            return "honeydew";
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_API_COLL) {
            return "cornsilk";
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_DATA_ANNO) {
            return "ivory";
        }
        return "white";
    };

    const setSysMark = async (value: boolean) => {
        await request(update_mark_sys({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            entry_id: props.entryInfo.entry_id,
            mark_sys: value,
        }));
        message.info("修改成功");
        props.onMarkSys();
    };

    const getBgImage = () => {
        if (props.entryInfo.entry_type == ENTRY_TYPE_DOC || props.entryInfo.entry_type == ENTRY_TYPE_FILE) {
            return docIcon;
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_SPRIT) {
            return spritIcon;
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_PAGES) {
            return htmlIcon;
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_BOARD) {
            return boardIcon;
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_API_COLL) {
            return apiCollIcon;
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_DATA_ANNO) {
            return dataAnnoIcon;
        }
        return "";
    };

    const moveToFolder = async (parentFolderId: string) => {
        await request(set_parent_folder({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            folder_or_entry_id: props.entryInfo.entry_id,
            is_folder: false,
            parent_folder_id: parentFolderId,
        }));
        setShowMoveModal(false);
        props.onMove();
        message.info("移动成功");
    };

    const calcTitle = (): string => {
        const retTitle = props.entryInfo.entry_title;
        if (props.entryInfo.entry_type == ENTRY_TYPE_API_COLL) {
            if (props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_GRPC) {
                return retTitle + "(GRPC)";
            } else if (props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_OPENAPI) {
                return retTitle + "(OPENAPI/SWAGGER)";
            } else if (props.entryInfo.extra_info.ExtraApiCollInfo?.api_coll_type == API_COLL_CUSTOM) {
                return retTitle + "(自定义接口)";
            }
        } else if (props.entryInfo.entry_type == ENTRY_TYPE_DATA_ANNO) {
            if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_CLASSIFI) {
                return retTitle + "(音频分类)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG) {
                return retTitle + "(音频分割)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_TRANS) {
                return retTitle + "(音频翻译)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_AUDIO_SEG_TRANS) {
                return retTitle + "(音频分段翻译)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CLASSIFI) {
                return retTitle + "(图像分类)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BBOX_OBJ_DETECT) {
                return retTitle + "(矩形对象检测)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_BRUSH_SEG) {
                return retTitle + "(画笔分割)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_CIRCULAR_OBJ_DETECT) {
                return retTitle + "(圆形对象检测)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_KEYPOINT) {
                return retTitle + "(图像关键点)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_IMAGE_POLYGON_SEG) {
                return retTitle + "(多边形分割)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_CLASSIFI) {
                return retTitle + "(文本分类)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_NER) {
                return retTitle + "(文本命名实体识别)";
            } else if (props.entryInfo.extra_info.ExtraDataAnnoInfo?.anno_type == ANNO_PROJECT_TEXT_SUMMARY) {
                return retTitle + "(文本摘要)";
            }
        }
        return retTitle;
    };

    return (
        <Card title={
            <Space size="small">
                <a onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (props.entryInfo.my_watch) {
                        entryStore.unwatchEntry(props.entryInfo.entry_id);
                    } else {
                        entryStore.watchEntry(props.entryInfo.entry_id);
                    }
                }}>
                    <span className={props.entryInfo.my_watch ? s.isCollect : s.noCollect} />
                </a>
                <span style={{ cursor: "pointer", fontWeight: 600 }} onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                    openEntry();
                }}>{getEntryTypeStr(props.entryInfo.entry_type)}</span>
            </Space>
        }
            className={s.card} style={{ backgroundColor: getBgColor(), backgroundImage: `url(${getBgImage()})`, backgroundRepeat: "no-repeat", backgroundPosition: "95% 95%" }}
            headStyle={{ borderBottom: "none" }} bodyStyle={{ padding: "0px 10px" }} extra={
                <Space>
                    <Popover placement="top" trigger="hover" content={<EntryPopover entryInfo={props.entryInfo} />}>
                        <InfoCircleOutlined />
                    </Popover>
                    {props.entryInfo.can_update && (
                        <Button style={{ minWidth: 0, padding: "0px 0px" }} type="text" icon={<EditOutlined />}
                            onClick={e => {
                                e.stopPropagation();
                                e.preventDefault();
                                entryStore.editEntryId = props.entryInfo.entry_id;
                            }} />
                    )}
                    <Popover trigger="click" placement="bottom" content={
                        <Space direction="vertical" style={{ padding: "10px 10px" }}>
                            {props.canMove && (
                                <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }} onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowMoveModal(true);
                                }}>移动到目录</Button>
                            )}
                            <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                                disabled={!props.entryInfo.can_remove}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setShowRemoveModal(true);
                                }}>移至回收站</Button>
                            {props.entryInfo.mark_sys == false && (
                                <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                                    disabled={!(projectStore.isAdmin || (props.entryInfo.create_user_id == userStore.userInfo.userId))}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setSysMark(true);
                                    }}>标记为系统面板</Button>
                            )}
                            {props.entryInfo.mark_sys == true && (
                                <Button type="link" style={{ minWidth: 0, padding: "0px 0px" }}
                                    disabled={!(projectStore.isAdmin || (props.entryInfo.create_user_id == userStore.userInfo.userId))}
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setSysMark(false);
                                    }}>取消系统面板标记</Button>
                            )}
                        </Space>
                    }>
                        <MoreOutlined />
                    </Popover>
                </Space>
            }>
            <a onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                openEntry();
            }} style={{ width: "180px", display: "block", height: "90px" }}>
                <h1 className={s.title} title={calcTitle()}>
                    {calcTitle()}
                </h1>
                <div className={s.tagList}>
                    {props.entryInfo.mark_sys && (
                        <Tag key="sys" style={{ backgroundColor: "yellow" }}>系统面板</Tag>
                    )}
                    {props.entryInfo.tag_list.map(tag => (
                        <Tag key={tag.tag_id} style={{ backgroundColor: tag.bg_color }}>{tag.tag_name}</Tag>
                    ))}
                </div>
            </a>
            {showRemoveModal == true && (
                <RemoveEntryModal entryInfo={props.entryInfo} onRemove={() => {
                    setShowRemoveModal(false);
                }} onCancel={() => setShowRemoveModal(false)} />
            )}
            {showPagesModal == true && (
                <PagesModal fileId={props.entryInfo.extra_info.ExtraPagesInfo?.file_id ?? ""}
                    entryId={props.entryInfo.entry_id} entryTitle={props.entryInfo.entry_title}
                    onClose={() => setShowPagesModal(false)} />
            )}
            {showFileModal == true && (
                <FileModal fileId={props.entryInfo.extra_info.ExtraFileInfo?.file_id ?? ""} fileName={props.entryInfo.extra_info.ExtraFileInfo?.file_name ?? ""}
                    onClose={() => setShowFileModal(false)} />
            )}
            {showMoveModal == true && (
                <MoveToFolderModal onCancel={() => setShowMoveModal(false)} onOk={folderId => moveToFolder(folderId)} />
            )}
        </Card>

    );
};

export default observer(EntryCard);