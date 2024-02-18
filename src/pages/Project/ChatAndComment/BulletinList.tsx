import React, { useEffect, useState } from "react";
import { observer } from 'mobx-react';
import { Card, Checkbox, Form, Table } from "antd";
import type { BulletinInfoKey } from "@/api/project_bulletin";
import { list_key, get as get_bulletin, mark_read } from "@/api/project_bulletin";
import { request } from "@/utils/request";
import { useStores } from "@/hooks";
import type { ColumnsType } from 'antd/lib/table';
import { listen } from '@tauri-apps/api/event';
import type * as NoticeType from '@/api/notice_type';
import moment from "moment";

const PAGE_SIZE = 20;

const BulletinList = () => {
    const userStore = useStores('userStore');
    const projectStore = useStores('projectStore');

    const [bulletinList, setBulletinList] = useState([] as BulletinInfoKey[]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);
    const [onlyUnRead, setOnlyUnRead] = useState(false);

    const loadBulletinList = async () => {
        const res = await request(list_key({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            list_un_read: onlyUnRead,
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setBulletinList(res.key_list);
    };

    const onUpdate = async (bulletinId: string) => {
        const res = await request(get_bulletin({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            bulletin_id: bulletinId,
        }));
        setBulletinList(oldList=>{
            const index = oldList.findIndex(item=>item.bulletin_id == bulletinId);
            if(index != -1){
                oldList[index] = res.key_info;
            }
            return oldList;
        });
    };

    const markRead = async (bulletinId: string) => {
        await request(mark_read({
            session_id: userStore.sessionId,
            project_id: projectStore.curProjectId,
            bulletin_id: bulletinId,
        }));
        const tmpList = bulletinList.slice();
        const index = tmpList.findIndex(item => item.bulletin_id == bulletinId);
        if (index != -1) {
            tmpList[index].my_un_read = false;
            setBulletinList(tmpList);
            await projectStore.updateBulletinStatus(projectStore.curProjectId);
        }
    };

    const columns: ColumnsType<BulletinInfoKey> = [
        {
            title: "标题",
            render: (_, row: BulletinInfoKey) => (
                <a style={{ fontWeight: row.my_un_read ? 700 : 0, color: row.my_un_read ? "bule" : "gray" }}
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                        projectStore.projectModal.bulletinId = row.bulletin_id;
                        markRead(row.bulletin_id);
                    }}>{row.title}</a>
            ),
        },
        {
            title: "发布时间",
            width: 120,
            render: (_, row: BulletinInfoKey) => moment(row.create_time).format("YYYY-MM-DD HH:mm"),
        }
    ];

    useEffect(() => {
        if (curPage != 0) {
            setCurPage(0);
        } else {
            loadBulletinList();
        }
    }, [onlyUnRead]);

    useEffect(() => {
        loadBulletinList();
    }, [curPage]);


    useEffect(() => {
        const unListenFn = listen<NoticeType.AllNotice>("notice", ev => {
            const notice = ev.payload;
            if (notice.ProjectNotice?.CreateBulletinNotice !== undefined && notice.ProjectNotice.CreateBulletinNotice.project_id == projectStore.curProjectId) {
                if (notice.ProjectNotice.CreateBulletinNotice.create_user_id == userStore.userInfo.userId) { //当前用户
                    if (curPage != 0) {
                        setCurPage(0);
                    } else {
                        loadBulletinList();
                    }
                } else {
                    if (curPage == 0) {
                        loadBulletinList();
                    }
                }
            } else if (notice.ProjectNotice?.UpdateBulletinNotice !== undefined && notice.ProjectNotice.UpdateBulletinNotice.project_id == projectStore.curProjectId) {
                onUpdate(notice.ProjectNotice.UpdateBulletinNotice.bulletin_id);
            } else if (notice.ProjectNotice?.RemoveBulletinNotice !== undefined && notice.ProjectNotice.RemoveBulletinNotice.project_id == projectStore.curProjectId) {
                console.log("xxxxxx", notice.ProjectNotice?.RemoveBulletinNotice);
                const bulletinId = notice.ProjectNotice.RemoveBulletinNotice.bulletin_id;
                setBulletinList(oldList => {
                    const tmpList = oldList.filter(item => item.bulletin_id != bulletinId);
                    return tmpList
                });
            }
        });
        return () => {
            unListenFn.then((unListen) => unListen());
        };
    }, []);

    return (
        <Card bordered={false} extra={
            <Form layout="inline">
                <Form.Item label="只看未读公告">
                    <Checkbox checked={onlyUnRead} onChange={e => {
                        e.stopPropagation();
                        setOnlyUnRead(e.target.checked);
                    }} />
                </Form.Item>
            </Form>
        }>
            <Table rowKey="bulletin_id" dataSource={bulletinList} columns={columns} scroll={{ y: "calc(100vh - 300px)" }}
                pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), hideOnSinglePage: true }} />
        </Card>
    );
};

export default observer(BulletinList);