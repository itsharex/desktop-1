import React, { useEffect, useState } from "react";
import type { EntryPerm } from "@/api/project_entry";
import { update_perm } from "@/api/project_entry";
import { Checkbox, Form, Modal } from "antd";
import { list_member, type MemberInfo } from "@/api/project_member";
import UserPhoto from "@/components/Portrait/UserPhoto";
import { get_session } from "@/api/user";
import { request } from "@/utils/request";

export interface UpdatePermModalProps {
    projectId: string;
    annoProjectId: string;
    entryPerm: EntryPerm;
    onCancel: () => void;
    onOk: () => void;
}

const UpdatePermModal = (props: UpdatePermModalProps) => {
    const [updateForAll, setUpdateForAll] = useState(props.entryPerm.update_for_all);
    const [userIdList, setUserIdList] = useState(props.entryPerm.extra_update_user_id_list);
    const [memberInfoList, setMemberInfoList] = useState<MemberInfo[]>([]);
    const [hasChange, setHasChange] = useState(false);

    const loadMemberInfoList = async () => {
        const sessionId = await get_session();
        const res = await request(list_member(sessionId, props.projectId, false, []));
        setMemberInfoList(res.member_list);
    };

    const updatePerm = async () => {
        const sessionId = await get_session();
        await request(update_perm({
            session_id: sessionId,
            project_id: props.projectId,
            entry_id: props.annoProjectId,
            entry_perm: {
                update_for_all: updateForAll,
                extra_update_user_id_list: updateForAll ? [] : userIdList,
            },
        }));
        props.onOk();
    };

    useEffect(() => {
        loadMemberInfoList();
    }, []);

    return (
        <Modal open title="修改权限"
            okText="修改" okButtonProps={{ disabled: !hasChange }}
            onCancel={e => {
                e.stopPropagation();
                e.preventDefault();
                props.onCancel();
            }}
            onOk={e => {
                e.stopPropagation();
                e.preventDefault();
                updatePerm();
            }}>
            <Form>
                <Form.Item label="所有成员可修改">
                    <Checkbox checked={updateForAll} onChange={e => {
                        e.stopPropagation();
                        setUpdateForAll(e.target.checked);
                        setHasChange(true);
                    }} />
                </Form.Item>
                {updateForAll == false && (
                    <Form.Item label="可修改成员">
                        <Checkbox.Group value={userIdList}
                            options={memberInfoList.filter(member => member.can_admin == false).map(member => (
                                {
                                    label: (<div>
                                        <UserPhoto logoUri={member.logo_uri} style={{ width: "16px", borderRadius: "10px", marginRight: "10px" }} />
                                        {member.display_name}
                                    </div>),
                                    value: member.member_user_id,
                                }
                            ))} onChange={value => {
                                setUserIdList(value as string[]);
                                setHasChange(true);
                            }} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default UpdatePermModal;