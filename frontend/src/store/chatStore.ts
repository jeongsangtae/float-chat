import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import { ChatMessage, UserInfo } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface ChatStore {
  socket: Socket | null;
  messages: ChatMessage[];
  newMessage: () => void;
  chatData: (roomId: string) => Promise<void>;
  sendMessage: (
    roomId: string,
    message: string,
    userInfo: UserInfo
  ) => Promise<void>;
}

const useChatStore = create<ChatStore>((set) => ({
  socket: null,
  messages: [],

  newMessage: () => {
    const socket = useSocketStore.getState().socket;
    console.log("소켓 있음? :", socket);
    if (!socket) return; // 소켓이 없으면 실행 안 함

    // socket.emit("joinRoom", { roomId });

    console.log("newMessage 이벤트 연결");

    // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
    socket.off("newMessage");

    // 서버로부터 새로운 메시지를 받을 때마다 메시지 목록에 추가
    // 새로운 메시지 중복 방지 코드
    // socket.on("newMessage", (newMessage: ChatMessage) => {
    //   set((prevMsg) => {
    //     // 기존 메시지와 새로운 메시지가 중복되지 않도록 처리
    //     const duplicateMessage = prevMsg.messages.some(
    //       (msg) => msg._id === newMessage._id
    //     );
    //     // 중복된 메시지는 추가하지 않음
    //     return duplicateMessage
    //       ? prevMsg
    //       : { messages: [...prevMsg.messages, newMessage] };
    //   });
    //   console.log("사용자 input 메시지: ", newMessage);
    // });

    socket.on("newMessage", (newMessage: ChatMessage) => {
      set((prevMsg) => ({
        messages: [...prevMsg.messages, newMessage],
      }));
      // setMessages((prevMsg) => [...prevMsg, newMessage]);
      console.log("사용자 input 메시지: ", newMessage.message);
    });

    return () => {
      socket.off("newMessage"); // 컴포넌트 언마운트 시 제거
    };
  },

  // 저장된 기존 메시지 불러오기
  chatData: async (roomId: string) => {
    try {
      const response = await fetch(`${apiURL}/chat/${roomId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("메시지 조회 실패");
      }

      const resData = await response.json();

      set({ messages: resData.messages });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "메시지를 불러오는 중에 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  sendMessage: async (roomId: string, message: string, userInfo: UserInfo) => {
    const newMessage = {
      roomId,
      message,
      email: userInfo.email,
    };

    try {
      // 서버로 메시지를 POST 요청으로 전송
      const response = await fetch(`${apiURL}/chat/${roomId}`, {
        method: "POST",
        body: JSON.stringify(newMessage),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("메시지 전송 실패");
      }

      console.log("메시지 전송 성공");
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "메시지를 전송하는 데 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },
}));

export default useChatStore;
