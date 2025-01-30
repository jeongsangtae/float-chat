import { create } from "zustand";

import { io } from "socket.io-client";

const apiURL = import.meta.env.VITE_API_URL;

interface ChatStore {
  socket: null;
  messages: string[];
  // chatData: (roomId: string) => void
  connect: () => void;
  sendMessage: (message: string) => void;
  testButton: () => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  messages: [],
  connect: () => {
    const newSocket = io(`${apiURL}`, {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("서버에 연결되었습니다:", newSocket.id);
    });

    newSocket.on("serverResponse", (msg) => {
      console.log("서버에서 전달하는 메시지:", msg);
    });

    // newSocket.on("newMessage", (newMessage: string) => {
    //   set((state) => ({
    //     messages: [...state.messages, newMessage],
    //   }));
    //   console.log("새 메시지:", newMessage);
    // });

    set({ socket: newSocket });

    return () => {
      newSocket.disconnect();
    };
  },
  // WebSocket 연결 및 실시간 메시지 수신
  // chatData: (roomId: string) => {
  //   try {
  //     const newSocket = io(`${apiURL}`, {
  //       withCredentials: true, // CORS 설정
  //     });

  //     newSocket.on("connect", () => {
  //       console.log("서버에 연결되었습니다:", newSocket.id);
  //       newSocket.emit("joinRoom", { roomId });
  //     });

  //     서버로부터 새로운 메시지를 받을 때마다 메시지 목록에 추가
  //     newSocket.on("newMessage", (newMessage: Message) => {
  //       set((prevMsg) => ({
  //         messages: [...prevMsg.messages, newMessage]
  //       }));
  //       // setMessages((prevMsg) => [...prevMsg, newMessage]);
  //       console.log("사용자 input 메시지: ", newMessage.content);
  //     });

  //     set({ socket: newSocket });

  //     컴포넌트가 언마운트될 때 WebSocket 연결 해제
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
  sendMessage: () => {},
  testButton: () => {
    if (get().socket) {
      get().socket.emit("testMessage", "테스트 메시지");
    }
  },
}));

export default useChatStore;
