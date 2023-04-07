import React, { useEffect, useState } from 'react';
import { useStores } from '@/hooks';
import { observer } from 'mobx-react';
import styles from './Chat.module.less';
import ChatMsgList from './ChatMsgList';
import {
  useCommonEditor,
  is_empty_doc,
  change_file_fs,
  get_reminder_info,
} from '@/components/Editor';
import { Modal, message } from 'antd';
import { request } from '@/utils/request';
import { send_msg, update_msg, MSG_LINK_NONE, LIST_CHAN_SCOPE_INCLUDE_ME } from '@/api/project_channel';
import { FILE_OWNER_TYPE_CHANNEL } from '@/api/fs';
import SendMsgBtn, { SEND_ACTION } from './SendMsgBtn';
import { useHistory } from 'react-router-dom';

const ChannelHeader = observer(() => {
  const history = useHistory();

  const projectStore = useStores('projectStore');
  const channelStore = useStores('channelStore');
  const chatMsgStore = useStores('chatMsgStore');
  const userStore = useStores('userStore');
  const linkAuxStore = useStores('linkAuxStore');

  const [sendOnHotKey, setSendOnHotKey] = useState(false);

  const editorParam = {
    content: '',
    fsId: projectStore.curProject?.channel_fs_id ?? '',
    ownerType: FILE_OWNER_TYPE_CHANNEL,
    ownerId: channelStore.curChannelId,
    historyInToolbar: false,
    clipboardInToolbar: false,
    widgetInToolbar: true,
    showReminder: true,
    channelMember: true,
  };

  const sendEditor = useCommonEditor({
    ...editorParam, 
    placeholder: "请输入......,可使用Ctrl+Enter发送内容",
    eventsOption: {
      keydown: e => {
        if (e.ctrlKey && e.key == "Enter") {
          setSendOnHotKey(true);
          return true;
        }
        return false;
      }
    }
  });

  const updateEditor = useCommonEditor(editorParam);

  useEffect(() => {
    const editMsg = chatMsgStore.getEditMsg();
    if (editMsg == undefined) {
      if (updateEditor.editorRef !== null) {
        updateEditor.editorRef.current?.clearContent();
      }
      return;
    }
    setTimeout(() => {
      console.log(editMsg!.msg.basic_msg.msg_data);
      if (updateEditor.editorRef !== null) {
        updateEditor.editorRef.current?.setContent(editMsg!.msg.basic_msg.msg_data);
      }
    }, 200);
  }, [chatMsgStore.getEditMsg()]);

  const sendContent = async (action: SEND_ACTION) => {
    setSendOnHotKey(false);
    const chatJson = sendEditor.editorRef.current?.getContent() || {
      type: 'doc',
    };
    if (is_empty_doc(chatJson)) {
      return;
    }

    await change_file_fs(
      chatJson,
      projectStore.curProject?.channel_fs_id ?? '',
      userStore.sessionId,
      FILE_OWNER_TYPE_CHANNEL,
      channelStore.curChannelId,
    );
    const remindInfo = get_reminder_info(chatJson);

    await request(
      send_msg(userStore.sessionId, projectStore.curProjectId, channelStore.curChannelId, {
        msg_data: JSON.stringify(chatJson),
        ref_msg_id: '',
        remind_info: remindInfo,
        link_type: MSG_LINK_NONE,
        link_dest_id: '',
      }),
    );
    sendEditor.editorRef.current?.clearContent();
    if (action != SEND_ACTION.SEND_ACTION_NULL) {
      message.info("发送消息成功");
    }
    if (action == SEND_ACTION.SEND_ACTION_CREATE_REQUIRE_MENT) {
      linkAuxStore.goToCreateRequirement(JSON.stringify(chatJson), projectStore.curProjectId, "", history);
    } else if (action == SEND_ACTION.SEND_ACTION_CREATE_TASK) {
      linkAuxStore.goToCreateTask(JSON.stringify(chatJson), projectStore.curProjectId, history);
    } else if (action == SEND_ACTION.SEND_ACTION_CREATE_BUG) {
      linkAuxStore.goToCreateBug(JSON.stringify(chatJson), projectStore.curProjectId, history);
    }
  };

  const updateContent = async () => {
    const editMsg = chatMsgStore.getEditMsg();
    if (editMsg == undefined) {
      return;
    }
    const chatJson = updateEditor.editorRef.current?.getContent() || {
      type: 'doc',
    };
    await change_file_fs(
      chatJson,
      projectStore.curProject?.channel_fs_id ?? '',
      userStore.sessionId,
      FILE_OWNER_TYPE_CHANNEL,
      channelStore.curChannelId,
    );
    const remindInfo = get_reminder_info(chatJson);
    await request(update_msg(userStore.sessionId, projectStore.curProjectId, channelStore.curChannelId, editMsg.msg.msg_id, {
      msg_data: JSON.stringify(chatJson),
      ref_msg_id: '',
      remind_info: remindInfo,
      link_type: MSG_LINK_NONE,
      link_dest_id: '',
    }));
    await chatMsgStore.updateMsg(editMsg.msg.msg_id);
    chatMsgStore.setEditMsg(undefined);
  };

  useEffect(() => {
    if (sendOnHotKey) {
      sendContent(SEND_ACTION.SEND_ACTION_NULL);
    }
  }, [sendOnHotKey]);

  return (
    <div className={styles.chat}>
      <ChatMsgList />
      {projectStore.curProject?.closed == false &&
        channelStore.channelScope == LIST_CHAN_SCOPE_INCLUDE_ME &&
        channelStore.curChannel?.channelInfo.readonly == false &&
        channelStore.curChannel?.channelInfo.closed == false && (
          <div className={styles.chatInput + ' _chatContext'}>
            {sendEditor.editor}
            <SendMsgBtn editorRef={sendEditor.editorRef} onSend={action => sendContent(action)} />
          </div>
        )}
      {chatMsgStore.getEditMsg() != undefined && (
        <Modal open
          title="修改聊天内容"
          width="80%"
          mask={false}
          style={{ height: "500px", paddingTop: "100px" }}
          onCancel={e => {
            e.stopPropagation();
            e.preventDefault();
            chatMsgStore.setEditMsg(undefined);
          }}
          onOk={e => {
            e.stopPropagation();
            e.preventDefault();
            updateContent();
          }}>
          <div className='_editChatContext'>
            {updateEditor.editor}
          </div>
        </Modal>
      )}
    </div>
  );
});

export default ChannelHeader;
