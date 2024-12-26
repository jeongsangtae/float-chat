import { ReactNode } from "react";

export interface ModalProps {
  children?: ReactNode;
  onToggle: () => void;
}

export interface GroupChatData {
  _id: string; // ObjectId는 JSON으로 변환되면 string으로 직렬화
  title: string;
  date: string;
}
