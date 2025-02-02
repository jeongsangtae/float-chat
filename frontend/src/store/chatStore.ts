import { create } from "zustand";

import { io } from "socket.io-client";

import { UserInfo } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface ChatStore {
  socket: null;
  messages: string[];
  chatData: (roomId: string) => void;
  connect: (roomId: string) => void;
  sendMessage: (roomId: string, message: string, userInfo: UserInfo) => void;
  // testButton: () => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  messages: [],
  // WebSocket 연결 및 실시간 메시지 수신
  connect: (roomId: string) => {
    try {
      const newSocket = io(`${apiURL}`, {
        withCredentials: true, // CORS 설정
      });

      newSocket.on("connect", () => {
        console.log("서버에 연결되었습니다:", newSocket.id);
        newSocket.emit("joinRoom", { roomId });
      });

      // newSocket.on("serverResponse", (msg) => {
      //   console.log("서버에서 전달하는 메시지:", msg);
      // });

      // 서버로부터 새로운 메시지를 받을 때마다 메시지 목록에 추가
      // newSocket.on("newMessage", (newMessage: string) => {
      //   set((prevMsg) => ({
      //     messages: [...prevMsg.messages, newMessage],
      //   }));
      //   // setMessages((prevMsg) => [...prevMsg, newMessage]);
      //   console.log("사용자 input 메시지: ", newMessage);
      // });

      // 새로운 메시지 중복 렌더링 방지 코드 테스트
      // newSocket.on("newMessage", (newMessage: string) => {
      //   set((prevState) => {
      //     // 기존 메시지와 새로운 메시지가 중복되지 않도록 처리
      //     const isDuplicate = prevState.messages.some(
      //       (msg) => msg._id === newMessage._id
      //     );
      //     // 중복된 메시지는 추가하지 않음
      //     if (isDuplicate) {
      //       return prevState;
      //     }

      //     // 새 메시지를 추가
      //     return {
      //       messages: [...prevState.messages, newMessage],
      //     };
      //   });
      //   console.log("사용자 input 메시지: ", newMessage);
      // });

      set({ socket: newSocket });

      // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
      return () => {
        newSocket.disconnect();
      };
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "서버와의 연결 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
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

      console.log(resData);

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

      const resData = await response.json();

      console.log(resData.newMessage);

      console.log("메시지 전송 성공");

      // 추가한 메시지 실시간 반영
      set((prev) => ({
        messages: [...prev.messages, resData.newMessage],
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "메시지를 전송하는 데 문제가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  // testButton: () => {
  //   if (get().socket) {
  //     get().socket.emit("testMessage", "테스트 메시지");
  //   }
  // },
}));

export default useChatStore;
