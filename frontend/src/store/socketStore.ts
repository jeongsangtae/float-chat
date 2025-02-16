import { create } from "zustand";

import { Socket, io } from "socket.io-client";

import useAuthStore from "./authStore";

const apiURL = import.meta.env.VITE_API_URL;

// const { userInfo } = useAuthStore();

const useSocketStore = create((set, get) => ({
  socket: null,
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
      });

      // 친구 요청 수신 이벤트
      newSocket.on("friendRequest", (newRequest) => {
        console.log("새로운 친구 요청 수신:", newRequest);

        set((state) => ({
          // friendRequests: [...state.friendRequests, newRequest],
          notification: [
            ...state.notification,
            { type: "friendRequest", data: newRequest },
          ],
        }));
      });

      set({ socket: newSocket });
    } catch (error) {
      console.error("에러 내용:", error);
      alert(
        "서버와의 연결 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요."
      );
    }
  },

  disconnect: () => {
    if (get().socket) {
      get().socket.disconnect();
      set({ socket: null });
      console.log("소켓 연결 해제");
    }
  },
}));

export default useSocketStore;
