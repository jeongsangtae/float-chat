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

export type ModalType = "login" | "signup" | "groupChatForm";
