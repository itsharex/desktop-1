import React, { useEffect, useState } from "react";
import { Button, Card, List, Tabs } from "antd";
import type { SoftWareCateInfo, SoftWareInfo } from "@/api/sw_store";
import { list_cate, list_soft_ware, OS_LINUX, OS_MAC, OS_WINDOWS } from "@/api/sw_store";
import { request } from "@/utils/request";
import { platform } from '@tauri-apps/api/os';
import { open as shell_open } from '@tauri-apps/api/shell';
import AsyncImage from "@/components/AsyncImage";
import { GLOBAL_SOFT_WARE_STORE_FS_ID } from "@/api/fs";
import defaultIcon from '@/assets/allIcon/app-default-icon.png';
import { ReadOnlyEditor } from "@/components/Editor";

const PAGE_SIZE = 12;

interface SoftWareListProps {
    cateId: string;
}



const SoftWareList = (props: SoftWareListProps) => {
    const [softWareList, setSoftWareList] = useState<SoftWareInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [curPage, setCurPage] = useState(0);

    const loadSoftWareList = async () => {
        let osType = OS_LINUX;
        const osName = await platform();
        if (osName == "win32") {
            osType = OS_WINDOWS;
        } else if (osName == "darwin") {
            osType = OS_MAC;
        }
        const res = await request(list_soft_ware({
            list_param: {
                filterby_os_type: true,
                os_type: osType,
                filter_by_cate_id: props.cateId != "",
                cate_id: props.cateId,
                filter_by_recommend: props.cateId == "",
                recommend: props.cateId == "",
            },
            offset: curPage * PAGE_SIZE,
            limit: PAGE_SIZE,
        }));
        setTotalCount(res.total_count);
        setSoftWareList(res.soft_ware_list);
    };

    useEffect(() => {
        loadSoftWareList();
    }, [props.cateId, curPage]);

    return (
        <List rowKey="sw_id" dataSource={softWareList}
            pagination={{ total: totalCount, current: curPage + 1, pageSize: PAGE_SIZE, onChange: page => setCurPage(page - 1), showSizeChanger: false,hideOnSinglePage:true }}
            renderItem={item => (
                <Card title={<span style={{ fontSize: "20px", fontWeight: 700 }}>{item.sw_name}</span>} bordered={false}
                    extra={
                        <Button type="link" onClick={e => {
                            e.stopPropagation();
                            e.preventDefault();
                            shell_open(item.download_url);
                        }}>下载页面</Button>
                    }>
                    <div style={{ display: "flex" }}>
                        <div>
                            <AsyncImage style={{ width: "80px", cursor: "pointer" }}
                                src={`fs://localhost/${GLOBAL_SOFT_WARE_STORE_FS_ID}/${item.icon_file_id}/icon.png`}
                                preview={false}
                                fallback={defaultIcon}
                                onClick={e=>{
                                    e.stopPropagation();
                                    e.preventDefault();
                                    shell_open(item.download_url);
                                }}
                                useRawImg={false}
                            />
                        </div>
                        <div style={{ flex: 1, paddingLeft: "20px" }}>
                            <ReadOnlyEditor content={item.sw_desc} />
                        </div>
                    </div>
                </Card>
            )} style={{ height: "calc(100vh - 130px)", overflowY: "scroll", paddingRight: "10px" }} />
    );
};

const SoftWareListPanel = () => {
    const [cateList, setCateList] = useState<SoftWareCateInfo[]>([]);
    const [activeKey, setActiveKey] = useState("");

    useEffect(() => {
        request(list_cate({})).then(res => setCateList([
            {
                cate_id: "",
                cate_name: "推荐软件",
                weight: 99,
                soft_ware_count: 0,
                create_time: 0,
                update_time: 0,
            },
            ...res.cate_list,
        ]));
    }, []);

    return (
        <Tabs activeKey={activeKey} onChange={key => setActiveKey(key)}
            items={cateList.map(cate => ({
                key: cate.cate_id,
                label: cate.cate_name,
                children: (
                    <>
                        {cate.cate_id == activeKey && (
                            <SoftWareList cateId={cate.cate_id} />
                        )}
                    </>
                ),
            }))} tabPosition="left" style={{ height: "calc(100vh - 130px)" }} type="card" tabBarStyle={{ width: "100px", overflow: "hidden" }} />
    );
};

export default SoftWareListPanel;