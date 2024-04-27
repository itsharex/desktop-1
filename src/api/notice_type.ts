//SPDX-FileCopyrightText:2022-2024 深圳市同心圆网络有限公司
//SPDX-License-Identifier: GPL-3.0-only

import type { COMMENT_TARGET_TYPE } from "./project_comment";

/* eslint-disable @typescript-eslint/no-namespace */

export namespace user {
  export type UserOnlineNotice = {
    user_id: string;
  };
  export type UserOfflineNotice = {
    user_id: string;
  };

  export type UserNewNoticeNotice = {
    user_id: string;
  }

  export type AllNotice = {
    UserOnlineNotice?: UserOnlineNotice;
    UserOfflineNotice?: UserOfflineNotice;
    UserNewNoticeNotice?: UserNewNoticeNotice;
  }
}

export namespace project {
  export type UpdateProjectNotice = {
    project_id: string;
  };
  export type RemoveProjectNotice = {
    project_id: string;
  };
  export type AddMemberNotice = {
    project_id: string;
    member_user_id: string;
  };
  export type UpdateMemberNotice = {
    project_id: string;
    member_user_id: string;
  };
  export type RemoveMemberNotice = {
    project_id: string;
    member_user_id: string;
  };


  export type NewEventNotice = {
    project_id: string;
    member_user_id: string;
    event_id: string;
  };
  export type SetMemberRoleNotice = {
    project_id: string;
    member_user_id: string;
    role_id: string;
  }

  export type UpdateShortNoteNotice = {
    project_id: string;
    member_user_id: string;
  };

  export type UpdateAlarmStatNotice = {
    project_id: string;
  };

  export type CreateBulletinNotice = {
    project_id: string;
    bulletin_id: string;
    create_user_id: string;
  }

  export type UpdateBulletinNotice = {
    project_id: string;
    bulletin_id: string;
  }

  export type RemoveBulletinNotice = {
    project_id: string;
    bulletin_id: string;
  }

  export type AddTagNotice = {
    project_id: string;
    tag_id: string;
  };

  export type UpdateTagNotice = {
    project_id: string;
    tag_id: string;
  };

  export type RemoveTagNotice = {
    project_id: string;
    tag_id: string;
  };

  export type UpdateSpritNotice = {
    project_id: string;
    sprit_id: string;
  };

  export type AllNotice = {
    UpdateProjectNotice?: UpdateProjectNotice;
    RemoveProjectNotice?: RemoveProjectNotice;
    AddMemberNotice?: AddMemberNotice;
    UpdateMemberNotice?: UpdateMemberNotice;
    RemoveMemberNotice?: RemoveMemberNotice;
    NewEventNotice?: NewEventNotice;
    SetMemberRoleNotice?: SetMemberRoleNotice;
    UpdateShortNoteNotice?: UpdateShortNoteNotice;
    UpdateAlarmStatNotice?: UpdateAlarmStatNotice;
    CreateBulletinNotice?: CreateBulletinNotice;
    UpdateBulletinNotice?: UpdateBulletinNotice;
    RemoveBulletinNotice?: RemoveBulletinNotice;
    AddTagNotice?: AddTagNotice;
    UpdateTagNotice?: UpdateTagNotice;
    RemoveTagNotice?: RemoveTagNotice;
    UpdateSpritNotice?: UpdateSpritNotice;
  };
}

export namespace project_doc {
  export type LinkSpritNotice = {
    project_id: string;
    doc_id: string;
    sprit_id: string;
  };

  export type CancelLinkSpritNotice = {
    project_id: string;
    doc_id: string;
    sprit_id: string;
  };
}

export namespace issue {
  export type NewIssueNotice = {
    project_id: string;
    issue_id: string;
    create_user_id: string;
  };

  export type UpdateIssueNotice = {
    project_id: string;
    issue_id: string;
  };

  export type RemoveIssueNotice = {
    project_id: string;
    issue_id: string;
  };

  export type SetSpritNotice = {
    project_id: string;
    issue_id: string;
    old_sprit_id: string;
    new_sprit_id: string;
  };

  export type UpdateIssueDepNotice = {
    project_id: string;
    issue_id: string;
    dep_issue_id: string;
  };

  export type UpdateSubIssueNotice = {
    project_id: string;
    issue_id: string;
  };

  export type AllNotice = {
    NewIssueNotice?: NewIssueNotice;
    RemoveIssueNotice?: RemoveIssueNotice;
    UpdateIssueNotice?: UpdateIssueNotice;
    SetSpritNotice?: SetSpritNotice;
    UpdateIssueDepNotice?: UpdateIssueDepNotice;
    UpdateSubIssueNotice?: UpdateSubIssueNotice;
  };
}

export namespace entry {
  export type NewFolderNotice = {
    project_id: string;
    folder_id: string;
    create_user_id: string;
  };

  export type UpdateFolderNotice = {
    project_id: string;
    folder_id: string;
  };

  export type RemoveFolderNotice = {
    project_id: string;
    folder_id: string;
  };

  export type NewEntryNotice = {
    project_id: string;
    entry_id: string;
    create_user_id: string;
  };

  export type UpdateEntryNotice = {
    project_id: string;
    entry_id: string;
  };

  export type RemoveEntryNotice = {
    project_id: string;
    entry_id: string;
  };

  export type AllNotice = {
    NewFolderNotice?: NewFolderNotice;
    UpdateFolderNotice?: UpdateFolderNotice;
    RemoveFolderNotice?: RemoveFolderNotice;
    NewEntryNotice?: NewEntryNotice;
    UpdateEntryNotice?: UpdateEntryNotice;
    RemoveEntryNotice?: RemoveEntryNotice;
  }
}

export namespace requirement {
  export type NewRequirementNotice = {
    project_id: string;
    requirement_id: string;
    create_user_id: string;
  };

  export type UpdateRequirementNotice = {
    project_id: string;
    requirement_id: string;
  };

  export type RemoveRequirementNotice = {
    project_id: string;
    requirement_id: string;
  };

  export type LinkIssueNotice = {
    project_id: string;
    requirement_id: string;
    issue_id: string;
  };

  export type UnlinkIssueNotice = {
    project_id: string;
    requirement_id: string;
    issue_id: string;
  };

  export type AllNotice = {
    NewRequirementNotice?: NewRequirementNotice;
    UpdateRequirementNotice?: UpdateRequirementNotice;
    RemoveRequirementNotice?: RemoveRequirementNotice;
    LinkIssueNotice?: LinkIssueNotice;
    UnlinkIssueNotice?: UnlinkIssueNotice;
  };
}

export namespace testcase {
  export type NewFolderNotice = {
    project_id: string;
    folder_id: string;
    create_user_id: string;
  };

  export type UpdateFolderNotice = {
    project_id: string;
    folder_id: string;
  };

  export type RemoveFolderNotice = {
    project_id: string;
    folder_id: string;
  };

  export type NewCaseNotice = {
    project_id: string;
    case_id: string;
    create_user_id: string;
  };

  export type UpdateCaseNotice = {
    project_id: string;
    case_id: string;
  };

  export type RemoveCaseNotice = {
    project_id: string;
    case_id: string;
  };

  export type LinkSpritNotice = {
    project_id: string;
    case_id: string;
    sprit_id: string;
  };

  export type UnlinkSpritNotice = {
    project_id: string;
    case_id: string;
    sprit_id: string;
  };

  export type AllNotice = {
    NewFolderNotice?: NewFolderNotice;
    UpdateFolderNotice?: UpdateFolderNotice;
    RemoveFolderNotice?: RemoveFolderNotice;
    NewCaseNotice?: NewCaseNotice;
    UpdateCaseNotice?: UpdateCaseNotice;
    RemoveCaseNotice?: RemoveCaseNotice;
    LinkSpritNotice?: LinkSpritNotice;
    UnlinkSpritNotice?: UnlinkSpritNotice;
  };
}

export namespace org {

  export type JoinOrgNotice = {
    org_id: string;
    member_user_id: string;
  };

  export type LeaveOrgNotice = {
    org_id: string;
    member_user_id: string;
  };

  export type UpdateOrgNotice = {
    org_id: string;
  };

  export type CreateDepartMentNotice = {
    org_id: string;
    depart_ment_id: string;
  };

  export type RemoveDepartMentNotice = {
    org_id: string;
    depart_ment_id: string;
  };

  export type UpdateDepartMentNotice = {
    org_id: string;
    depart_ment_id: string;
  };

  export type UpdateMemberNotice = {
    org_id: string;
    member_user_id: string;
  };

  export type AllNotice = {
    JoinOrgNotice?: JoinOrgNotice;
    LeaveOrgNotice?: LeaveOrgNotice;
    UpdateOrgNotice?: UpdateOrgNotice;
    CreateDepartMentNotice?: CreateDepartMentNotice;
    RemoveDepartMentNotice?: RemoveDepartMentNotice;
    UpdateDepartMentNotice?: UpdateDepartMentNotice;
    UpdateMemberNotice?: UpdateMemberNotice;
  };
}

export namespace client {
  export type WrongSessionNotice = {
    name: string;
  };

  export type GitPostHookNotice = {
    project_id: string;
  };

  export type LocalProxyStopNotice = {};


  export type StartMinAppNotice = {
    min_app_id: string;
  };

  export type OpenEntryNotice = {
    project_id: string;
    entry_id: string;
  };

  export type NewExtraTokenNotice = {
    extra_token: string;
  };

  export type AtomGitLoginNotice = {
    code: string;
  };

  export type AllNotice = {
    WrongSessionNotice?: WrongSessionNotice;
    GitPostHookNotice?: GitPostHookNotice;
    LocalProxyStopNotice?: LocalProxyStopNotice;
    StartMinAppNotice?: StartMinAppNotice;
    OpenEntryNotice?: OpenEntryNotice;
    NewExtraTokenNotice?: NewExtraTokenNotice;
    AtomGitLoginNotice?: AtomGitLoginNotice;
  };
}

export namespace idea {
  export type KeywordChangeNotice = {
    project_id: string;
    add_keyword_list: string[];
    remove_keyword_list: string[];
  };

  export type CreateGroupNotice = {
    project_id: string;
  };

  export type UpdateGroupNotice = {
    project_id: string;
    idea_group_id: string;
  }

  export type RemoveGroupNotice = {
    project_id: string;
    idea_group_id: string;
  };

  export type CreateIdeaNotice = {
    project_id: string;
    idea_group_id: string;
  };

  export type UpdateIdeaNotice = {
    project_id: string;
    idea_id: string;
  };

  export type RemoveIdeaNotice = {
    project_id: string;
    idea_id: string;
  };

  export type MoveIdeaNotice = {
    project_id: string;
    idea_id: string;
    from_idea_group_id: string;
    to_idea_group_id: string;
  };

  export type ClearGroupNotice = {
    project_id: string;
    idea_group_id: string;
  }

  export type AllNotice = {
    KeywordChangeNotice?: KeywordChangeNotice;
    CreateGroupNotice?: CreateGroupNotice;
    UpdateGroupNotice?: UpdateGroupNotice;
    RemoveGroupNotice?: RemoveGroupNotice;
    CreateIdeaNotice?: CreateIdeaNotice;
    UpdateIdeaNotice?: UpdateIdeaNotice;
    RemoveIdeaNotice?: RemoveIdeaNotice;
    MoveIdeaNotice?: MoveIdeaNotice;
    ClearGroupNotice?: ClearGroupNotice;
  };
}

export namespace comment {
  export type AddCommentNotice = {
    project_id: string;
    comment_id: string;
    target_type: COMMENT_TARGET_TYPE;
    target_id: string;

  };

  export type UpdateCommentNotice = {
    project_id: string;
    comment_id: string;
    target_type: COMMENT_TARGET_TYPE;
    target_id: string;
  };

  export type RemoveCommentNotice = {
    project_id: string;
    comment_id: string;
    target_type: COMMENT_TARGET_TYPE;
    target_id: string;
  };

  export type RemoveUnReadNotice = {
    project_id: string;
  };

  export type AllNotice = {
    AddCommentNotice?: AddCommentNotice;
    UpdateCommentNotice?: UpdateCommentNotice;
    RemoveCommentNotice?: RemoveCommentNotice;
    RemoveUnReadNotice?: RemoveUnReadNotice;
  };
}

export namespace board {
  export type CreateNodeNotice = {
    project_id: string;
    board_id: string;
    node_id: string;
  };

  export type UpdateNodeNotice = {
    project_id: string;
    board_id: string;
    node_id: string;
  };

  export type RemoveNodeNotice = {
    project_id: string;
    board_id: string;
    node_id: string;
  };

  export type CreateEdgeNotice = {
    project_id: string;
    board_id: string;
    from_node_id: string;
    from_handle_id: string;
    to_node_id: string;
    to_handle_id: string;
  };
  export type UpdateEdgeNotice = {
    project_id: string;
    board_id: string;
    from_node_id: string;
    from_handle_id: string;
    to_node_id: string;
    to_handle_id: string;
  };
  export type RemoveEdgeNotice = {
    project_id: string;
    board_id: string;
    from_node_id: string;
    from_handle_id: string;
    to_node_id: string;
    to_handle_id: string;
  };

  export type AllNotice = {
    CreateNodeNotice?: CreateNodeNotice;
    UpdateNodeNotice?: UpdateNodeNotice;
    RemoveNodeNotice?: RemoveNodeNotice;
    CreateEdgeNotice?: CreateEdgeNotice;
    UpdateEdgeNotice?: UpdateEdgeNotice;
    RemoveEdgeNotice?: RemoveEdgeNotice;
  };
}

export namespace chat {

  export type UpdateGroupNotice = {
    project_id: string;
    chat_group_id: string;
  };

  export type UpdateGroupMemberNotice = {
    project_id: string;
    chat_group_id: string;
  };

  export type LeaveGroupNotice = {
    project_id: string;
    chat_group_id: string;
  };

  export type NewMsgNotice = {
    project_id: string;
    chat_group_id: string;
    chat_msg_id: string;
  };

  export type UpdateMsgNotice = {
    project_id: string;
    chat_group_id: string;
    chat_msg_id: string;
  };

  export type AllNotice = {
    UpdateGroupNotice?: UpdateGroupNotice;
    UpdateGroupMemberNotice?: UpdateGroupMemberNotice;
    LeaveGroupNotice?: LeaveGroupNotice;
    NewMsgNotice?: NewMsgNotice;
    UpdateMsgNotice?: UpdateMsgNotice;
  };
}

export type AllNotice = {
  UserNotice?: user.AllNotice;
  ProjectNotice?: project.AllNotice;
  IssueNotice?: issue.AllNotice;
  ClientNotice?: client.AllNotice;
  IdeaNotice?: idea.AllNotice;
  CommentNotice?: comment.AllNotice;
  BoardNotice?: board.AllNotice;
  ChatNotice?: chat.AllNotice;
  EntryNotice?: entry.AllNotice;
  RequirementNotice?: requirement.AllNotice;
  TestcaseNotice?: testcase.AllNotice;
  OrgNotice?: org.AllNotice;
};
