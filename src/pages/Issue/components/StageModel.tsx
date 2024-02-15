import Button from '@/components/Button';
import type { ModalProps } from 'antd';
import { Form, message, Modal } from 'antd';
import type { FC } from 'react';
import React from 'react';
import s from './StageModel.module.less';
import { useStores } from '@/hooks';
import StageFormItem, { STAGE_FORM_TYPE_ENUM } from '@/components/StageFormItem';
import { formConfig } from '@/config/form';
import { observer } from 'mobx-react';
import type { ChangeStateRequest, IssueInfo } from '@/api/project_issue';
import { request } from '@/utils/request';
import { assign_check_user, assign_exec_user, change_state, ISSUE_TYPE_TASK } from '@/api/project_issue';
import { ISSUE_STATE_PROCESS, ISSUE_STATE_CHECK } from '@/api/project_issue';
import { is_empty_doc, useSimpleEditor } from '@/components/Editor';
import { add_comment, COMMENT_TARGET_BUG, COMMENT_TARGET_TASK } from "@/api/project_comment";

type StageModelProps = ModalProps & {
  issue: IssueInfo;
  onClose: () => void;
};

const StageModel: FC<StageModelProps> = observer((props) => {
  const { onClose, issue } = props;
  const [form] = Form.useForm();
  const userStore = useStores('userStore');
  const projectStore = useStores('projectStore');
  const session_id = userStore.sessionId || '';
  const project_id = projectStore.curProjectId;

  const { editor, editorRef } = useSimpleEditor("请输入备注(可选)");

  const updateIssue = async (changeStateReq: ChangeStateRequest, destUserId: string, issueInfo: IssueInfo) => {
    if (issueInfo.state != changeStateReq.state) {
      const changeStatRes = await request(change_state(changeStateReq));
      if (!changeStatRes) {
        return;
      }
    }
    // 处理人接口
    if (
      changeStateReq.state === ISSUE_STATE_PROCESS &&
      destUserId !== issueInfo.exec_user_id
    ) {
      const assginRes = await request(assign_exec_user(changeStateReq.session_id, changeStateReq.project_id, changeStateReq.issue_id, destUserId));
      if (!assginRes) {
        return;
      }
    }

    // 验收人接口
    if (
      changeStateReq.state === ISSUE_STATE_CHECK &&
      destUserId !== issueInfo.check_user_id
    ) {
      const assginRes = await request(assign_check_user(changeStateReq.session_id, changeStateReq.project_id, changeStateReq.issue_id, destUserId));
      if (!assginRes) {
        return;
      }
    }

    //处理备注
    if (editorRef.current == null) {
      return;
    }
    const content = editorRef.current.getContent();
    if (is_empty_doc(content)) {
      return;
    }
    await request(add_comment({
      session_id: changeStateReq.session_id,
      project_id: changeStateReq.project_id,
      target_type: props.issue.issue_type == ISSUE_TYPE_TASK ? COMMENT_TARGET_TASK : COMMENT_TARGET_BUG,
      target_id: props.issue.issue_id,
      content: JSON.stringify(content),
    }));
  }

  const handleOk = async () => {
    form.submit();
    const { stage_item_select_user, stage_item_status } = form.getFieldsValue();
    if (ISSUE_STATE_PROCESS == stage_item_status) {
      if (stage_item_select_user == "") {
        message.error("未指定处理人");
        return;
      } else if (stage_item_select_user == props.issue.check_user_id) {
        message.error("处理人和验收人不能相同");
        return;
      }
    }
    if (ISSUE_STATE_CHECK == stage_item_status) {
      if (stage_item_select_user == "") {
        message.error("未指定验收人");
        return;
      } else if (stage_item_select_user == props.issue.exec_user_id) {
        message.error("验收人和处理人不能相同");
        return;
      }
    }

    await updateIssue({
      session_id,
      project_id,
      issue_id: issue.issue_id || '',
      state: stage_item_status,
    }, stage_item_select_user, issue);
    message.success('阶段更新成功');
    onClose();
  };

  return (
    <Modal
      open={true}
      width={'540px'}
      bodyStyle={{
        minHeight: '150px',
        position: 'relative',
        padding: '20px 30px 50px 0px',
      }}
      footer={false}
      onCancel={() => onClose()}
    >
      <Form
        form={form}
        {...formConfig.layout}
      >
        <StageFormItem form={form} details={issue} type={STAGE_FORM_TYPE_ENUM.MODEL} editor={editor} />
        <div className={s.foooter}>
          <Button key="cancel" ghost onClick={() => onClose()}>
            取消
          </Button>
          <Button onClick={handleOk}>确定</Button>
        </div>
      </Form>
    </Modal>
  );
});

export default StageModel;
