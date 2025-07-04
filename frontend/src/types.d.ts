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

export interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  id: string | null;
}

export interface GroupChatData {
  _id: string; // ObjectId는 JSON으로 변환되면 string으로 직렬화
  hostId: string;
  title: string;
  date?: string;
  contextMenu: ContextMenu;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu>>;
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

export interface UserInfo {
  _id: string;
  email: string;
  username: string;
  nickname: string;
  avatarColor: string;
  tokenExp: number;
}

export interface RoomId {
  roomId?: string;
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

export interface FriendUser {
  id: string; // _id 대신 id 사용
  userId: string;
  nickname: string;
  avatarColor: string;
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
  requesterNickname: string;
  requesterAvatarColor: string;
  receiver: string;
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
