import { ReactNode } from "react";

export interface ModalProps {
  children?: ReactNode;
  onToggle: () => void;
}

export interface Participants {
  _id: string;
  nickname: string;
}

export interface DirectChatData {
  _id: string;
  participants: Participants[];
  date: string;
}

export interface DirectChatProps {
  _id: string;
  otherUserId: string;
  otherUserNickname: string;
}

export interface GroupChatData {
  _id: string; // ObjectId는 JSON으로 변환되면 string으로 직렬화
  hostId: string;
  title: string;
  date?: string;
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
  status: string;
}

export interface GroupChatInviteProps {
  roomId?: string;
  friendId: string;
  nickname: string;
}

export interface GroupChatInviteListProps {
  groupChatId: string;
  groupChatInviteId: string;
  requester: string;
  requesterNickname: string;
  roomTitle: string;
  status: string;
}

export interface UserInfo {
  _id: string;
  email: string;
  username: string;
  nickname: string;
  tokenExp: number;
}

export interface RoomId {
  roomId?: string;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  message: string;
  email: string;
  date: string;
}

export interface FriendUser {
  id: string; // _id 대신 id 사용
  userId: string;
  nickname: string;
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
  receiver: string;
  receiverNickname: string;
  date: string;
  status: string;
}

export interface NotificationData {
  id: string;
  message: string;
  requester?: string; // 친구 요청일 경우만 존재
  roomTitle?: string; // 메시지 알림일 경우만 존재
}

export interface Notification {
  id: string;
  type: "friendRequest" | "messageNotification" | "groupChatInviteNotification";
  data: NotificationData;
}

export type ModalType = "login" | "signup" | "groupChatForm";
