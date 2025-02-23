import { create } from "zustand";

import { io, Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import { ChatMessage, UserInfo } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface ChatStore {
  socket: Socket | null;
  messages: ChatMessage[];
  connect: (roomId: string) => void;
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

  newMessage: (roomId: string) => {
    const socket = useSocketStore.getState().socket;
    if (!socket) return; // 소켓이 없으면 실행 안 함

    // socket.emit("joinRoom", { roomId });

    socket.off("newMessage");

    // 서버로부터 새로운 메시지를 받을 때마다 메시지 목록에 추가
    // 새로운 메시지 중복 방지 코드
    socket.on("newMessage", (newMessage: ChatMessage) => {
      set((prevMsg) => {
        // 기존 메시지와 새로운 메시지가 중복되지 않도록 처리
        const duplicateMessage = prevMsg.messages.some(
          (msg) => msg._id === newMessage._id
        );
        // 중복된 메시지는 추가하지 않음
        if (duplicateMessage) {
          return prevMsg;
        }

        // 새 메시지를 추가
        return {
          messages: [...prevMsg.messages, newMessage],
        };
      });
      console.log("사용자 input 메시지: ", newMessage);
    });
  },

  // WebSocket 연결 및 실시간 메시지 수신
  // connect: (roomId: string) => {
  //   try {
  //     const newSocket = io(`${apiURL}`, {
  //       withCredentials: true, // CORS 설정
  //     });

  //     newSocket.on("connect", () => {
  //       console.log("서버에 연결되었습니다:", newSocket.id);
  //     });

  //     // newSocket.on("newMessage", (newMessage: string) => {
  //     //   set((prevMsg) => ({
  //     //     messages: [...prevMsg.messages, newMessage],
  //     //   }));
  //     //   console.log("사용자 input 메시지: ", newMessage);
  //     // });

  //     // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
  //     return () => {
  //       newSocket.disconnect();
  //     };
  //   } catch (error) {
  //     console.error("에러 내용:", error);
  //     alert(
  //       "서버와의 연결 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요."
  //     );
  //   }
  // },

  connect: (roomId: string) => {
    try {
      const newSocket = io(`${apiURL}`, {
        withCredentials: true, // CORS 설정
      });

      newSocket.on("connect", () => {
        console.log("서버에 연결되었습니다:", newSocket.id);
        newSocket.emit("joinRoom", { roomId });
      });

      // newSocket.on("newMessage", (newMessage: string) => {
      //   set((prevMsg) => ({
      //     messages: [...prevMsg.messages, newMessage],
      //   }));
      //   console.log("사용자 input 메시지: ", newMessage);
      // });

      // 서버로부터 새로운 메시지를 받을 때마다 메시지 목록에 추가
      // 새로운 메시지 중복 방지 코드
      newSocket.on("newMessage", (newMessage: ChatMessage) => {
        set((prevMsg) => {
          // 기존 메시지와 새로운 메시지가 중복되지 않도록 처리
          const duplicateMessage = prevMsg.messages.some(
            (msg) => msg._id === newMessage._id
          );
          // 중복된 메시지는 추가하지 않음
          if (duplicateMessage) {
            return prevMsg;
          }

          // 새 메시지를 추가
          return {
            messages: [...prevMsg.messages, newMessage],
          };
        });
        console.log("사용자 input 메시지: ", newMessage);
      });

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
