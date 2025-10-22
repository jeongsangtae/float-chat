import React, { ReactNode } from "react";

export interface ChildrenProps {
  children: ReactNode;
}

export interface ModalProps {
  children?: ReactNode;
  onToggle: () => void;
}

export interface Participants {
  _id: string;
  nickname: string;
  avatarColor: string;
  isVisible: boolean;
}

export interface DirectChatData {
  _id: string;
  participants: Participants[];
  date: string;
  lastMessageDate: string;
}

export interface DirectChatProps {
  _id: string;
  otherUserId: string;
  otherUserNickname: string;
  otherUserAvatarColor: string;
  onlineChecked: boolean;
}

export interface MutualFriendUser {
  id: string;
  email?: string;
  nickname: string;
  avatarColor: string;
  roomId: string;
}

export interface DirectChatPanelProps {
  chatInfo: ChatInfo;
  onlineChecked: boolean;
  friendSince: string;
  mutualGroupChats: GroupChatData[];
  mutualFriendUsers: MutualFriendUser[];
  // mutualFriendUsersWithRoomId: MutualFriendUser[];
}

export interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  id: string | null;
}

export interface GroupChatData {
  _id: string; // ObjectId는 JSON으로 변환되면 string으로 직렬화
  hostId: string;
  hostEmail: string;
  hostUsername: string;
  hostNickname: string;
  hostAvatarColor: string;
  announcement?: string;
  title: string;
  date?: string;
  users?: string[];
}

export interface GroupChatUserData {
  _id: string;
  email: string;
  username: string;
  nickname: string;
  avatarColor: string;
  date: string;
  onlineChecked: boolean;
}

export interface GroupChatUsersProps {
  groupChatUsers: GroupChatUserData[];
}

export interface GroupChatInvites {
  _id: string;
  roomId: string;
  roomTitle: string;
  requester: string;
  requesterNickname: string;
  receiver: string;
  receiverNickname: string;
  date: string;
  kstDate: string;
  status: string;
  participantCount: number;
  avatarColor: string;
}

export interface GroupChatProps {
  _id: string;
  hostId: string;
  title: string;
  contextMenu: ContextMenu;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu>>;
}

export interface GroupChatInviteProps {
  roomId: string;
  friendId: string;
  nickname: string;
  avatarColor: string;
  onToggle: () => void;
}

export interface GroupChatInviteListProps {
  groupChatId: string;
  groupChatInviteId: string;
  requester: string;
  requesterNickname: string;
  roomTitle: string;
  status: string;
  kstDate: string;
  participantCount: number;
  avatarColor: string;
}

export interface GroupChatPanelProps {
  groupChatSince: string;
  groupChatId: string;
  userId: string;
  hostId: string;
  hostNickname: string;
  hostAvatarColor: string;
  announcement?: string;
  groupChatUsers: GroupChatUserData[];
}

export interface UserInfo {
  _id: string;
  email: string;
  username: string;
  nickname: string;
  avatarColor: string;
  avatarImageUrl: string;
  tokenExp: number;
}

export interface RoomId {
  roomId?: string;
}

export interface ChatInfo {
  nickname?: string;
  avatarColor?: string;
  title?: string;
}

export interface ChatsProps {
  roomId?: string;
  type: "direct" | "group";
  chatInfo: ChatInfo;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  email: string;
  nickname: string;
  message: string;
  avatarColor: string;
  date: string;
}

export interface LastReadMessage {
  userId: string;
  roomId: string;
  lastVisibleMessageId: string | null;
}

export interface FriendUser {
  id: string; // _id 대신 id 사용
  userId: string;
  email?: string;
  nickname: string;
  avatarColor: string;
  onlineChecked: boolean;
}

export interface Friend {
  _id: string;
  date: string;
  status: string;
  receiver: FriendUser;
  requester: FriendUser;
}

export interface FriendRequest {
  _id: string;
  requester: string;
  requesterEmail: string;
  requesterNickname: string;
  requesterAvatarColor: string;
  receiver: string;
  receiverEmail: string;
  receiverNickname: string;
  receiverAvatarColor: string;
  date: string;
  status: string;
}

// export interface NotificationData {
//   id: string;
//   message: string;
//   senderNickname: string;
//   roomTitle?: string;
// }

export interface Notification {
  type: "friendRequest" | "messageNotification" | "groupChatInviteNotification";
  id: string;
  roomTitle?: string;
  senderNickname: string;
  avatarColor: string;
  message: string;
}
