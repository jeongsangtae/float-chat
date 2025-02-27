import { ReactNode } from "react";

export interface ModalProps {
  children?: ReactNode;
  onToggle: () => void;
}

export interface GroupChatData {
  _id: string; // ObjectId는 JSON으로 변환되면 string으로 직렬화
  title: string;
  date?: string;
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
  room_id: string;
  message: string;
  email: string;
  date: string;
}

export interface Friend {
  _id: string;
  date: string;
  receiver: Pick<UserInfo, "_id" | "nickname">; // _id와 nickname만 사용
  requester: Pick<UserInfo, "_id" | "nickname">; // _id와 nickname만 사용
  status: string;
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

export type ModalType = "login" | "signup" | "groupChatForm";
