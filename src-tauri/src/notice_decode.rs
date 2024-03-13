pub mod project {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_project;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        UpdateProjectNotice(notices_project::UpdateProjectNotice),
        RemoveProjectNotice(notices_project::RemoveProjectNotice),
        AddMemberNotice(notices_project::AddMemberNotice),
        UpdateMemberNotice(notices_project::UpdateMemberNotice),
        RemoveMemberNotice(notices_project::RemoveMemberNotice),
        UserOnlineNotice(notices_project::UserOnlineNotice),
        UserOfflineNotice(notices_project::UserOfflineNotice),
        NewEventNotice(notices_project::NewEventNotice),
        SetMemberRoleNotice(notices_project::SetMemberRoleNotice),
        UpdateShortNoteNotice(notices_project::UpdateShortNoteNotice),
        UpdateAlarmStatNotice(notices_project::UpdateAlarmStatNotice),
        CreateBulletinNotice(notices_project::CreateBulletinNotice),
        UpdateBulletinNotice(notices_project::UpdateBulletinNotice),
        RemoveBulletinNotice(notices_project::RemoveBulletinNotice),
        AddTagNotice(notices_project::AddTagNotice),
        UpdateTagNotice(notices_project::UpdateTagNotice),
        RemoveTagNotice(notices_project::RemoveTagNotice),
        UpdateSpritNotice(notices_project::UpdateSpritNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_project::UpdateProjectNotice::type_url() {
            if let Ok(notice) = notices_project::UpdateProjectNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateProjectNotice(notice));
            }
        } else if data.type_url == notices_project::RemoveProjectNotice::type_url() {
            if let Ok(notice) = notices_project::RemoveProjectNotice::decode(data.value.as_slice())
            {
                return Some(Notice::RemoveProjectNotice(notice));
            }
        } else if data.type_url == notices_project::AddMemberNotice::type_url() {
            if let Ok(notice) = notices_project::AddMemberNotice::decode(data.value.as_slice()) {
                return Some(Notice::AddMemberNotice(notice));
            }
        } else if data.type_url == notices_project::UpdateMemberNotice::type_url() {
            if let Ok(notice) = notices_project::UpdateMemberNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateMemberNotice(notice));
            }
        } else if data.type_url == notices_project::RemoveMemberNotice::type_url() {
            if let Ok(notice) = notices_project::RemoveMemberNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveMemberNotice(notice));
            }
        } else if data.type_url == notices_project::UserOnlineNotice::type_url() {
            if let Ok(notice) = notices_project::UserOnlineNotice::decode(data.value.as_slice()) {
                return Some(Notice::UserOnlineNotice(notice));
            }
        } else if data.type_url == notices_project::UserOfflineNotice::type_url() {
            if let Ok(notice) = notices_project::UserOfflineNotice::decode(data.value.as_slice()) {
                return Some(Notice::UserOfflineNotice(notice));
            }
        } else if data.type_url == notices_project::NewEventNotice::type_url() {
            if let Ok(notice) = notices_project::NewEventNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewEventNotice(notice));
            }
        } else if data.type_url == notices_project::SetMemberRoleNotice::type_url() {
            if let Ok(notice) = notices_project::SetMemberRoleNotice::decode(data.value.as_slice())
            {
                return Some(Notice::SetMemberRoleNotice(notice));
            }
        } else if data.type_url == notices_project::UpdateShortNoteNotice::type_url() {
            if let Ok(notice) =
                notices_project::UpdateShortNoteNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateShortNoteNotice(notice));
            }
        } else if data.type_url == notices_project::UpdateAlarmStatNotice::type_url() {
            if let Ok(notice) =
                notices_project::UpdateAlarmStatNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateAlarmStatNotice(notice));
            }
        } else if data.type_url == notices_project::CreateBulletinNotice::type_url() {
            if let Ok(notice) = notices_project::CreateBulletinNotice::decode(data.value.as_slice())
            {
                return Some(Notice::CreateBulletinNotice(notice));
            }
        } else if data.type_url == notices_project::UpdateBulletinNotice::type_url() {
            if let Ok(notice) = notices_project::UpdateBulletinNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateBulletinNotice(notice));
            }
        } else if data.type_url == notices_project::RemoveBulletinNotice::type_url() {
            if let Ok(notice) = notices_project::RemoveBulletinNotice::decode(data.value.as_slice())
            {
                return Some(Notice::RemoveBulletinNotice(notice));
            }
        } else if data.type_url == notices_project::AddTagNotice::type_url() {
            if let Ok(notice) = notices_project::AddTagNotice::decode(data.value.as_slice()) {
                return Some(Notice::AddTagNotice(notice));
            }
        } else if data.type_url == notices_project::UpdateTagNotice::type_url() {
            if let Ok(notice) = notices_project::UpdateTagNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateTagNotice(notice));
            }
        } else if data.type_url == notices_project::RemoveTagNotice::type_url() {
            if let Ok(notice) = notices_project::RemoveTagNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveTagNotice(notice));
            }
        } else if data.type_url == notices_project::UpdateSpritNotice::type_url() {
            if let Ok(notice) = notices_project::UpdateSpritNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateSpritNotice(notice));
            }
        }
        None
    }
}

pub mod issue {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_issue;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        NewIssueNotice(notices_issue::NewIssueNotice),
        RemoveIssueNotice(notices_issue::RemoveIssueNotice),
        UpdateIssueNotice(notices_issue::UpdateIssueNotice),
        SetSpritNotice(notices_issue::SetSpritNotice),
        UpdateIssueDepNotice(notices_issue::UpdateIssueDepNotice),
        UpdateSubIssueNotice(notices_issue::UpdateSubIssueNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_issue::NewIssueNotice::type_url() {
            if let Ok(notice) = notices_issue::NewIssueNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewIssueNotice(notice));
            }
        } else if data.type_url == notices_issue::RemoveIssueNotice::type_url() {
            if let Ok(notice) = notices_issue::RemoveIssueNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveIssueNotice(notice));
            }
        } else if data.type_url == notices_issue::UpdateIssueNotice::type_url() {
            if let Ok(notice) = notices_issue::UpdateIssueNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateIssueNotice(notice));
            }
        } else if data.type_url == notices_issue::SetSpritNotice::type_url() {
            if let Ok(notice) = notices_issue::SetSpritNotice::decode(data.value.as_slice()) {
                return Some(Notice::SetSpritNotice(notice));
            }
        } else if data.type_url == notices_issue::UpdateIssueDepNotice::type_url() {
            if let Ok(notice) = notices_issue::UpdateIssueDepNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateIssueDepNotice(notice));
            }
        } else if data.type_url == notices_issue::UpdateSubIssueNotice::type_url() {
            if let Ok(notice) = notices_issue::UpdateSubIssueNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateSubIssueNotice(notice));
            }
        }
        None
    }
}

pub mod idea {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_idea;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        KeywordChangeNotice(notices_idea::KeywordChangeNotice),
        CreateGroupNotice(notices_idea::CreateGroupNotice),
        UpdateGroupNotice(notices_idea::UpdateGroupNotice),
        RemoveGroupNotice(notices_idea::RemoveGroupNotice),
        CreateIdeaNotice(notices_idea::CreateIdeaNotice),
        UpdateIdeaNotice(notices_idea::UpdateIdeaNotice),
        RemoveIdeaNotice(notices_idea::RemoveIdeaNotice),
        MoveIdeaNotice(notices_idea::MoveIdeaNotice),
        ClearGroupNotice(notices_idea::ClearGroupNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_idea::KeywordChangeNotice::type_url() {
            if let Ok(notice) = notices_idea::KeywordChangeNotice::decode(data.value.as_slice()) {
                return Some(Notice::KeywordChangeNotice(notice));
            }
        } else if data.type_url == notices_idea::CreateGroupNotice::type_url() {
            if let Ok(notice) = notices_idea::CreateGroupNotice::decode(data.value.as_slice()) {
                return Some(Notice::CreateGroupNotice(notice));
            }
        } else if data.type_url == notices_idea::UpdateGroupNotice::type_url() {
            if let Ok(notice) = notices_idea::UpdateGroupNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateGroupNotice(notice));
            }
        } else if data.type_url == notices_idea::RemoveGroupNotice::type_url() {
            if let Ok(notice) = notices_idea::RemoveGroupNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveGroupNotice(notice));
            }
        } else if data.type_url == notices_idea::CreateIdeaNotice::type_url() {
            if let Ok(notice) = notices_idea::CreateIdeaNotice::decode(data.value.as_slice()) {
                return Some(Notice::CreateIdeaNotice(notice));
            }
        } else if data.type_url == notices_idea::UpdateIdeaNotice::type_url() {
            if let Ok(notice) = notices_idea::UpdateIdeaNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateIdeaNotice(notice));
            }
        } else if data.type_url == notices_idea::RemoveIdeaNotice::type_url() {
            if let Ok(notice) = notices_idea::RemoveIdeaNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveIdeaNotice(notice));
            }
        } else if data.type_url == notices_idea::MoveIdeaNotice::type_url() {
            if let Ok(notice) = notices_idea::MoveIdeaNotice::decode(data.value.as_slice()) {
                return Some(Notice::MoveIdeaNotice(notice));
            }
        } else if data.type_url == notices_idea::ClearGroupNotice::type_url() {
            if let Ok(notice) = notices_idea::ClearGroupNotice::decode(data.value.as_slice()) {
                return Some(Notice::ClearGroupNotice(notice));
            }
        }
        None
    }
}

pub mod comment {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_comment;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        AddCommentNotice(notices_comment::AddCommentNotice),
        UpdateCommentNotice(notices_comment::UpdateCommentNotice),
        RemoveCommentNotice(notices_comment::RemoveCommentNotice),
        RemoveUnReadNotice(notices_comment::RemoveUnReadNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_comment::AddCommentNotice::type_url() {
            if let Ok(notice) = notices_comment::AddCommentNotice::decode(data.value.as_slice()) {
                return Some(Notice::AddCommentNotice(notice));
            }
        } else if data.type_url == notices_comment::UpdateCommentNotice::type_url() {
            if let Ok(notice) = notices_comment::UpdateCommentNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateCommentNotice(notice));
            }
        } else if data.type_url == notices_comment::RemoveCommentNotice::type_url() {
            if let Ok(notice) = notices_comment::RemoveCommentNotice::decode(data.value.as_slice())
            {
                return Some(Notice::RemoveCommentNotice(notice));
            }
        } else if data.type_url == notices_comment::RemoveUnReadNotice::type_url() {
            if let Ok(notice) = notices_comment::RemoveUnReadNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveUnReadNotice(notice));
            }
        }
        None
    }
}

pub mod board {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_board;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        CreateNodeNotice(notices_board::CreateNodeNotice),
        UpdateNodeNotice(notices_board::UpdateNodeNotice),
        RemoveNodeNotice(notices_board::RemoveNodeNotice),
        CreateEdgeNotice(notices_board::CreateEdgeNotice),
        UpdateEdgeNotice(notices_board::UpdateEdgeNotice),
        RemoveEdgeNotice(notices_board::RemoveEdgeNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_board::CreateNodeNotice::type_url() {
            if let Ok(notice) = notices_board::CreateNodeNotice::decode(data.value.as_slice()) {
                return Some(Notice::CreateNodeNotice(notice));
            }
        } else if data.type_url == notices_board::UpdateNodeNotice::type_url() {
            if let Ok(notice) = notices_board::UpdateNodeNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateNodeNotice(notice));
            }
        } else if data.type_url == notices_board::RemoveNodeNotice::type_url() {
            if let Ok(notice) = notices_board::RemoveNodeNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveNodeNotice(notice));
            }
        } else if data.type_url == notices_board::CreateEdgeNotice::type_url() {
            if let Ok(notice) = notices_board::CreateEdgeNotice::decode(data.value.as_slice()) {
                return Some(Notice::CreateEdgeNotice(notice));
            }
        } else if data.type_url == notices_board::UpdateEdgeNotice::type_url() {
            if let Ok(notice) = notices_board::UpdateEdgeNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateEdgeNotice(notice));
            }
        } else if data.type_url == notices_board::RemoveEdgeNotice::type_url() {
            if let Ok(notice) = notices_board::RemoveEdgeNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveEdgeNotice(notice));
            }
        }
        None
    }
}

pub mod chat {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_chat;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        UpdateGroupNotice(notices_chat::UpdateGroupNotice),
        UpdateGroupMemberNotice(notices_chat::UpdateGroupMemberNotice),
        LeaveGroupNotice(notices_chat::LeaveGroupNotice),
        NewMsgNotice(notices_chat::NewMsgNotice),
        UpdateMsgNotice(notices_chat::UpdateMsgNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_chat::UpdateGroupNotice::type_url() {
            if let Ok(notice) = notices_chat::UpdateGroupNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateGroupNotice(notice));
            }
        } else if data.type_url == notices_chat::UpdateGroupMemberNotice::type_url() {
            if let Ok(notice) = notices_chat::UpdateGroupMemberNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateGroupMemberNotice(notice));
            }
        } else if data.type_url == notices_chat::LeaveGroupNotice::type_url() {
            if let Ok(notice) = notices_chat::LeaveGroupNotice::decode(data.value.as_slice()) {
                return Some(Notice::LeaveGroupNotice(notice));
            }
        } else if data.type_url == notices_chat::NewMsgNotice::type_url() {
            if let Ok(notice) = notices_chat::NewMsgNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewMsgNotice(notice));
            }
        } else if data.type_url == notices_chat::UpdateMsgNotice::type_url() {
            if let Ok(notice) = notices_chat::UpdateMsgNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateMsgNotice(notice));
            }
        }
        None
    }
}

pub mod entry {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_entry;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        NewFolderNotice(notices_entry::NewFolderNotice),
        UpdateFolderNotice(notices_entry::UpdateFolderNotice),
        RemoveFolderNotice(notices_entry::RemoveFolderNotice),
        NewEntryNotice(notices_entry::NewEntryNotice),
        UpdateEntryNotice(notices_entry::UpdateEntryNotice),
        RemoveEntryNotice(notices_entry::RemoveEntryNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_entry::NewFolderNotice::type_url() {
            if let Ok(notice) = notices_entry::NewFolderNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewFolderNotice(notice));
            }
        } else if data.type_url == notices_entry::UpdateFolderNotice::type_url() {
            if let Ok(notice) = notices_entry::UpdateFolderNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateFolderNotice(notice));
            }
        } else if data.type_url == notices_entry::RemoveFolderNotice::type_url() {
            if let Ok(notice) = notices_entry::RemoveFolderNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveFolderNotice(notice));
            }
        } else if data.type_url == notices_entry::NewEntryNotice::type_url() {
            if let Ok(notice) = notices_entry::NewEntryNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewEntryNotice(notice));
            }
        } else if data.type_url == notices_entry::UpdateEntryNotice::type_url() {
            if let Ok(notice) = notices_entry::UpdateEntryNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateEntryNotice(notice));
            }
        } else if data.type_url == notices_entry::RemoveEntryNotice::type_url() {
            if let Ok(notice) = notices_entry::RemoveEntryNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveEntryNotice(notice));
            }
        }
        None
    }
}

pub mod requirement {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_requirement;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        NewRequirementNotice(notices_requirement::NewRequirementNotice),
        UpdateRequirementNotice(notices_requirement::UpdateRequirementNotice),
        RemoveRequirementNotice(notices_requirement::RemoveRequirementNotice),
        LinkIssueNotice(notices_requirement::LinkIssueNotice),
        UnlinkIssueNotice(notices_requirement::UnlinkIssueNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_requirement::NewRequirementNotice::type_url() {
            if let Ok(notice) =
                notices_requirement::NewRequirementNotice::decode(data.value.as_slice())
            {
                return Some(Notice::NewRequirementNotice(notice));
            }
        } else if data.type_url == notices_requirement::UpdateRequirementNotice::type_url() {
            if let Ok(notice) =
                notices_requirement::UpdateRequirementNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateRequirementNotice(notice));
            }
        } else if data.type_url == notices_requirement::RemoveRequirementNotice::type_url() {
            if let Ok(notice) =
                notices_requirement::RemoveRequirementNotice::decode(data.value.as_slice())
            {
                return Some(Notice::RemoveRequirementNotice(notice));
            }
        } else if data.type_url == notices_requirement::LinkIssueNotice::type_url() {
            if let Ok(notice) = notices_requirement::LinkIssueNotice::decode(data.value.as_slice())
            {
                return Some(Notice::LinkIssueNotice(notice));
            }
        } else if data.type_url == notices_requirement::UnlinkIssueNotice::type_url() {
            if let Ok(notice) =
                notices_requirement::UnlinkIssueNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UnlinkIssueNotice(notice));
            }
        }
        None
    }
}

pub mod testcase {
    use prost::Message;
    use proto_gen_rust::google::protobuf::Any;
    use proto_gen_rust::notices_testcase;
    use proto_gen_rust::TypeUrl;

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        NewFolderNotice(notices_testcase::NewFolderNotice),
        UpdateFolderNotice(notices_testcase::UpdateFolderNotice),
        RemoveFolderNotice(notices_testcase::RemoveFolderNotice),
        NewCaseNotice(notices_testcase::NewCaseNotice),
        UpdateCaseNotice(notices_testcase::UpdateCaseNotice),
        RemoveCaseNotice(notices_testcase::RemoveCaseNotice),
        LinkSpritNotice(notices_testcase::LinkSpritNotice),
        UnlinkSpritNotice(notices_testcase::UnlinkSpritNotice),
    }

    pub fn decode_notice(data: &Any) -> Option<Notice> {
        if data.type_url == notices_testcase::NewFolderNotice::type_url() {
            if let Ok(notice) = notices_testcase::NewFolderNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewFolderNotice(notice));
            }
        } else if data.type_url == notices_testcase::UpdateFolderNotice::type_url() {
            if let Ok(notice) = notices_testcase::UpdateFolderNotice::decode(data.value.as_slice())
            {
                return Some(Notice::UpdateFolderNotice(notice));
            }
        } else if data.type_url == notices_testcase::RemoveFolderNotice::type_url() {
            if let Ok(notice) = notices_testcase::RemoveFolderNotice::decode(data.value.as_slice())
            {
                return Some(Notice::RemoveFolderNotice(notice));
            }
        } else if data.type_url == notices_testcase::NewCaseNotice::type_url() {
            if let Ok(notice) = notices_testcase::NewCaseNotice::decode(data.value.as_slice()) {
                return Some(Notice::NewCaseNotice(notice));
            }
        } else if data.type_url == notices_testcase::UpdateCaseNotice::type_url() {
            if let Ok(notice) = notices_testcase::UpdateCaseNotice::decode(data.value.as_slice()) {
                return Some(Notice::UpdateCaseNotice(notice));
            }
        } else if data.type_url == notices_testcase::RemoveCaseNotice::type_url() {
            if let Ok(notice) = notices_testcase::RemoveCaseNotice::decode(data.value.as_slice()) {
                return Some(Notice::RemoveCaseNotice(notice));
            }
        } else if data.type_url == notices_testcase::LinkSpritNotice::type_url() {
            if let Ok(notice) = notices_testcase::LinkSpritNotice::decode(data.value.as_slice()) {
                return Some(Notice::LinkSpritNotice(notice));
            }
        } else if data.type_url == notices_testcase::UnlinkSpritNotice::type_url() {
            if let Ok(notice) = notices_testcase::UnlinkSpritNotice::decode(data.value.as_slice()) {
                return Some(Notice::UnlinkSpritNotice(notice));
            }
        }
        None
    }
}

pub mod client {
    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    #[serde(rename_all = "snake_case")]
    pub struct WrongSessionNotice {
        pub name: String, //用于区分发生错误的地方
    }


    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    #[serde(rename_all = "snake_case")]
    pub struct GitPostHookNotice {
        pub project_id: String,
    }

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    #[serde(rename_all = "snake_case")]
    pub struct LocalProxyStopNotice {}

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    #[serde(rename_all = "snake_case")]
    pub struct StartMinAppNotice {
        pub min_app_id: String,
    }

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    #[serde(rename_all = "snake_case")]
    pub struct OpenEntryNotice {
        pub project_id: String,
        pub entry_id: String,
    }

    #[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
    pub enum Notice {
        WrongSessionNotice(WrongSessionNotice),
        GitPostHookNotice(GitPostHookNotice),
        LocalProxyStopNotice(LocalProxyStopNotice),
        StartMinAppNotice(StartMinAppNotice),
        OpenEntryNotice(OpenEntryNotice),
    }
}

#[derive(serde::Serialize, serde::Deserialize, Clone, PartialEq, Debug)]
pub enum NoticeMessage {
    ProjectNotice(project::Notice),
    IssueNotice(issue::Notice),
    IdeaNotice(idea::Notice),
    CommentNotice(comment::Notice),
    BoardNotice(board::Notice),
    ChatNotice(chat::Notice),
    EntryNotice(entry::Notice),
    RequirementNotice(requirement::Notice),
    TestcaseNotice(testcase::Notice),
    ClientNotice(client::Notice),
}

use proto_gen_rust::google::protobuf::Any;

pub fn decode_notice(data: &Any) -> Option<NoticeMessage> {
    if let Some(ret) = project::decode_notice(data) {
        return Some(NoticeMessage::ProjectNotice(ret));
    }
    if let Some(ret) = issue::decode_notice(data) {
        return Some(NoticeMessage::IssueNotice(ret));
    }
    if let Some(ret) = idea::decode_notice(data) {
        return Some(NoticeMessage::IdeaNotice(ret));
    }
    if let Some(ret) = comment::decode_notice(data) {
        return Some(NoticeMessage::CommentNotice(ret));
    }
    if let Some(ret) = board::decode_notice(data) {
        return Some(NoticeMessage::BoardNotice(ret));
    }
    if let Some(ret) = chat::decode_notice(data) {
        return Some(NoticeMessage::ChatNotice(ret));
    }
    if let Some(ret) = entry::decode_notice(data) {
        return Some(NoticeMessage::EntryNotice(ret));
    }
    if let Some(ret) = requirement::decode_notice(data) {
        return Some(NoticeMessage::RequirementNotice(ret));
    }
    if let Some(ret) = testcase::decode_notice(data) {
        return Some(NoticeMessage::TestcaseNotice(ret));
    }
    None
}

pub fn new_wrong_session_notice(name: String) -> NoticeMessage {
    return NoticeMessage::ClientNotice(client::Notice::WrongSessionNotice(
        client::WrongSessionNotice { name: name },
    ));
}

pub fn new_git_post_hook_notice(project_id: String) -> NoticeMessage {
    return NoticeMessage::ClientNotice(client::Notice::GitPostHookNotice(
        client::GitPostHookNotice {
            project_id: project_id,
        },
    ));
}

pub fn new_local_proxy_stop_notice() -> NoticeMessage {
    return NoticeMessage::ClientNotice(client::Notice::LocalProxyStopNotice(
        client::LocalProxyStopNotice {},
    ));
}

pub fn new_start_min_app_notice(min_app_id: String) -> NoticeMessage {
    return NoticeMessage::ClientNotice(client::Notice::StartMinAppNotice(
        client::StartMinAppNotice {
            min_app_id: min_app_id,
        },
    ));
}

pub fn new_open_entry_notice(project_id: String, entry_id: String) -> NoticeMessage {
    return NoticeMessage::ClientNotice(client::Notice::OpenEntryNotice(client::OpenEntryNotice {
        project_id: project_id,
        entry_id: entry_id,
    }));
}
