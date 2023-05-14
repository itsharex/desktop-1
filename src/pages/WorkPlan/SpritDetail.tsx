import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { useHistory, useLocation } from "react-router-dom";
import { LinkChannelInfo } from "@/stores/linkAux";
import { get as get_sprit, remove as remove_sprit, link_channel, cancel_link_channel, watch, un_watch } from "@/api/project_sprit";
import type { SpritInfo } from "@/api/project_sprit";
import { useStores } from "@/hooks";
import { request } from "@/utils/request";
import Button from "@/components/Button";
import { LeftOutlined, MoreOutlined } from "@ant-design/icons";
import { Card, message, Modal, Popover, Space, Tabs, Tag } from 'antd';
import s from './SpritDetail.module.less';
import moment from "moment";
import IssuePanel from "./components/IssuePanel";
import StatPanel from "./components/StatPanel";
import GanttPanel from "./components/GanttPanel";
import LinkDocPanel from "./components/LinkDocPanel";
import { EditSelect } from "@/components/EditCell/EditSelect";
import KanbanPanel from "./components/KanbanPanel";
import BurnDownPanel from "./components/BurnDownPanel";
import { APP_PROJECT_WORK_PLAN_PATH } from "@/utils/constant";

const SpritDetail = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');
    const linkAuxStore = useStores('linkAuxStore');
    const spritStore = useStores('spritStore');
    const channelStore = useStores('channelStore');

    const location = useLocation();
    const tabStr = new URLSearchParams(location.search).get('tab') ?? "";

    const history = useHistory();

    const [activeKey, setActiveKey] = useState("");
    const [spritInfo, setSpritInfo] = useState<SpritInfo | null>(null);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const loadSpritInfo = async () => {
        const res = await request(get_sprit(userStore.sessionId, projectStore.curProjectId, spritStore.curSpritId));
        setSpritInfo(res.info);
    };

    const removeSprit = async () => {
        await request(remove_sprit(userStore.sessionId, projectStore.curProjectId, spritStore.curSpritId));
        message.info("删除工作计划成功");
        setShowRemoveModal(false);
        await spritStore.setCurSpritId("");
        if (spritInfo?.my_watch) {
            spritStore.loadCurWatchList(projectStore.curProjectId);
        }
    };

    const watchSprit = async () => {
        await request(watch(userStore.sessionId, projectStore.curProjectId, spritStore.curSpritId));
        if (spritInfo != null) {
            setSpritInfo({ ...spritInfo, my_watch: true });
        }
        await spritStore.loadCurWatchList(projectStore.curProjectId);
    };

    const unWatchSprit = async () => {
        await request(un_watch(userStore.sessionId, projectStore.curProjectId, spritStore.curSpritId));
        if (spritInfo != null) {
            setSpritInfo({ ...spritInfo, my_watch: false });
        }
        await spritStore.loadCurWatchList(projectStore.curProjectId);
    };

    useEffect(() => {
        if (spritStore.curSpritId != "") {
            setActiveKey("issue");
            loadSpritInfo();
        }
    }, [spritStore.curSpritId]);

    useEffect(() => {
        if (tabStr != "") {
            setActiveKey(tabStr);
        }
    }, [tabStr]);

    return (
        <Card bordered={false}
            style={{ marginRight: "60px" }}
            bodyStyle={{ height: "calc(100vh - 130px)", overflowY: "scroll" }}
            title={
                <h2 className={s.head}>
                    <a onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        spritStore.setCurSpritId("");
                        history.push(APP_PROJECT_WORK_PLAN_PATH);
                    }}><LeftOutlined /></a>
                    &nbsp;{spritInfo?.basic_info.title ?? ""}
                </h2>} extra={
                    <Space>
                        <a onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (spritInfo != null) {
                                if (spritInfo.my_watch) {
                                    unWatchSprit();
                                } else {
                                    watchSprit();
                                }
                            }
                        }}>
                            <i className={spritInfo?.my_watch ? s.isCollect : s.noCollect} />
                        </a>
                        {projectStore.isAdmin && (
                            <Popover trigger="click" placement="bottom" content={
                                <div style={{ padding: "10px 10px" }}>
                                    <Button type="link" danger onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setShowRemoveModal(true);
                                    }}>删除工作计划</Button>
                                </div>
                            }>
                                <MoreOutlined />
                            </Popover>
                        )}
                    </Space>
                }>

            <div className={s.sprit_wrap}>
                <div className={s.info_wrap}>
                    <div className={s.label}>时间区间：</div>
                    {spritInfo != null && (
                        <div>
                            {moment(spritInfo.basic_info.start_time).format("YYYY-MM-DD")}
                            &nbsp;至&nbsp;
                            {moment(spritInfo.basic_info.end_time).format("YYYY-MM-DD")}
                        </div>
                    )}
                </div>
                {(spritInfo?.basic_info.non_work_day_list.length ?? 0) > 0 && (
                    <div className={s.info_wrap}>
                        <div className={s.label}>非工作日：</div>
                        <div>
                            {spritInfo?.basic_info.non_work_day_list.map(item => (
                                <Tag key={item}>{moment(item).format("YYYY-MM-DD")}</Tag>
                            ))}
                        </div>
                    </div>
                )}
                <div className={s.info_wrap}>
                    <div className={s.label}>关联频道：</div>
                    {spritInfo !== null && (<div>
                        <EditSelect
                            width="150px"
                            editable={projectStore.isAdmin && !projectStore.curProject?.setting.disable_chat}
                            curValue={spritInfo?.link_channel_id ?? ""}
                            itemList={[
                                { value: "", label: "-", color: "black" },
                                ...(channelStore.channelList.filter(ch => ch.channelInfo.system_channel == false).map(ch => {
                                    return { value: ch.channelInfo.channel_id, label: ch.channelInfo.basic_info.channel_name, color: "black" };
                                })),
                            ]}
                            onChange={async (value) => {
                                if (value == undefined) {
                                    return false;
                                }
                                try {
                                    if (value == "") {
                                        const res = await cancel_link_channel(userStore.sessionId, projectStore.curProjectId, spritInfo?.sprit_id ?? "");
                                        if (res.code != 0) {
                                            return false;
                                        }
                                        if (spritInfo !== null) {
                                            setSpritInfo({
                                                ...spritInfo,
                                                link_channel_id: "",
                                                link_channel_title: "",
                                            });
                                        }
                                    } else {
                                        const res = await link_channel(userStore.sessionId, projectStore.curProjectId, spritInfo?.sprit_id ?? "", value as string);
                                        if (res.code != 0) {
                                            return false;
                                        }
                                        if (spritInfo !== null) {
                                            setSpritInfo({
                                                ...spritInfo,
                                                link_channel_id: value as string,
                                                link_channel_title: channelStore.getChannel(value as string)?.channelInfo.basic_info.channel_name ?? "",
                                            });
                                        }
                                    }
                                    return true;
                                } catch (e) {
                                    console.log(e);
                                }
                                return false;
                            }} showEditIcon={!projectStore.curProject?.setting.disable_chat} allowClear={false} />
                        {((spritInfo?.link_channel_id.length ?? 0) > 0) && (
                            <Button type="link" style={{ marginLeft: "20px" }}
                                disabled={projectStore.curProject?.setting.disable_chat}
                                onClick={e => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    linkAuxStore.goToLink(new LinkChannelInfo("", projectStore.curProjectId, spritInfo.link_channel_id ?? ""), history);
                                }}>进入沟通频道</Button>
                        )}
                    </div>
                    )}
                </div>
            </div>
            <div>
                <Tabs
                    activeKey={activeKey}
                    type="card"
                    onChange={value => {
                        history.push(`${location.pathname}?tab=${value}`);
                    }}>
                    <Tabs.TabPane tab="任务/缺陷" key="issue">
                        {activeKey == "issue" && spritInfo != null && <IssuePanel spritId={spritStore.curSpritId} startTime={spritInfo.basic_info.start_time} endTime={spritInfo.basic_info.end_time} />}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="看板" key="kanban">
                        {activeKey == "kanban" && <KanbanPanel />}
                    </Tabs.TabPane>
                    {!projectStore.curProject?.setting.disable_kb && (
                        <Tabs.TabPane tab="相关文档" key="linkDoc">
                            {activeKey == "linkDoc" && <LinkDocPanel />}
                        </Tabs.TabPane>
                    )}
                    <Tabs.TabPane tab="甘特图" key="gantt" disabled={!spritStore.allTimeReady}>
                        {activeKey == "gantt" && spritInfo != null && <GanttPanel spritName={spritInfo.basic_info.title} startTime={spritInfo.basic_info.start_time} endTime={spritInfo.basic_info.end_time} />}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="燃尽图" key="burnDown" disabled={!spritStore.allTimeReady}>
                        {activeKey == "burnDown" && spritInfo != null && <BurnDownPanel spritInfo={spritInfo} />}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="统计信息" key="statistics" disabled={!spritStore.allTimeReady}>
                        {activeKey == "statistics" && <StatPanel />}
                    </Tabs.TabPane>
                </Tabs>
            </div>
            {showRemoveModal == true && (
                <Modal
                    title="删除工作计划"
                    open
                    onCancel={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowRemoveModal(false);
                    }}
                    onOk={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        removeSprit();
                    }}>
                    删除工作计划后，相关任务和缺陷会被设置成未关联工作计划状态。
                </Modal>
            )}
        </Card>
    );
};

export default observer(SpritDetail);