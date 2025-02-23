import { create } from "zustand";

import { Socket, io } from "socket.io-client";

import useAuthStore from "./authStore";
import useFriendStore from "./friendStore";
import useChatStore from "./chatStore";

const apiURL = import.meta.env.VITE_API_URL;

// const { userInfo } = useAuthStore();

const useSocketStore = create((set, get) => ({
  socket: null,
  currentRoom: localStorage.getItem("currentRoom") || null,
  notification: [],
  connect: () => {
    try {
      const { userInfo } = useAuthStore.getState();
      if (!userInfo?._id) return;
      if (get().socket) return; // 이미 연결된 경우 중복 연결 방지

      const newSocket = io(`${apiURL}`, {
        withCredentials: true, // CORS 설정
      });

      newSocket.on("connect", () => {
        console.log("소켓 연결됨:", userInfo?._id);
        newSocket.emit("registerUser", userInfo?._id);

        // 새로고침 후 자동으로 마지막 채팅방 다시 입장
        const lastRoom = localStorage.getItem("currentRoom");
        if (lastRoom) {
          get().joinGroupChat(lastRoom);
          useChatStore.getState().newMessage(); // 메시지 수신 이벤트 등록 추가
        }
      });

      // 친구 요청 수신 이벤트
      newSocket.on("friendRequest", (newRequest) => {
        console.log("친구 요청 알림 수신:", newRequest);

        set((state) => ({
          notification: [
            ...state.notification,
            { type: "friendRequest", data: newRequest, id: newRequest.id },
          ],
        }));

        setTimeout(() => {
          set((state) => ({
            notification: state.notification.filter(
              (notif) => notif.id !== newRequest.id
            ),
          }));
        }, 7000);

        useFriendStore.getState().loadFriendRequests();
      });

      set({ socket: newSocket });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "서버와의 연결 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  joinGroupChat: (roomId) => {
    const socket = get().socket;
    if (!socket) return;

    if (get().currentRoom) {
      socket.emit("leaveRoom", get().currentRoom);
    }

    socket.emit("joinRoom", { roomId });
    set({ currentRoom: roomId });

    // 새로고침해도 유지되도록 localStorage에 저장
    localStorage.setItem("currentRoom", roomId);

    console.log(`${roomId} 그룹 채팅방 입장`);
  },

  leaveGroupChat: () => {},

  disconnect: () => {
    if (get().socket) {
      get().socket.disconnect();
      set({ socket: null });
      console.log("소켓 연결 해제");

      // 로그아웃 시 채팅방 정보도 초기화
      localStorage.removeItem("currentRoom");
    }
  },
}));

export default useSocketStore;
