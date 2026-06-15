import { create } from "zustand";
import { toast } from "react-toastify";

import { Socket, io } from "socket.io-client";

import { NotificationData } from "../types";

import useAuthStore from "./authStore";
import useFriendStore from "./friendStore";
import useChatStore from "./chatStore";

const apiURL = import.meta.env.VITE_API_URL;

interface SocketStore {
  socket: Socket | null;
  currentRoom: string | null; // 방 번호인 _id (로컬 스토리지에서 가져옴)
  notification: NotificationData[]; // 토스트용
  notificationHistory: NotificationData[]; // 알림 보관용
  unReadNotification: boolean;
  connect: () => void;
  readNotification: () => void;
  clearNotification: () => void;
  joinChatRoom: (roomId: string) => void;
  leaveChatRoom: () => void;
  disconnect: () => void;
}

const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  currentRoom: localStorage.getItem("currentRoom") || null,
  notification: [],
  notificationHistory: [],
  unReadNotification: false,
  connect: () => {
    try {
      const { userInfo } = useAuthStore.getState();
      if (!userInfo?._id) return;
      if (get().socket) return; // 이미 연결된 경우 중복 연결 방지

      const newSocket = io(`${apiURL}`, {
        withCredentials: true, // CORS 설정
      });

      newSocket.on("connect", () => {
        newSocket.emit("registerUser", userInfo?._id);

        // 새로고침 후 자동으로 마지막 채팅방 다시 입장
        const lastRoom = localStorage.getItem("currentRoom");
        if (lastRoom) {
          get().joinChatRoom(lastRoom);
        }
      });

      // 친구 요청 알림 수신 이벤트
      newSocket.on("friendRequest", (newRequest) => {
        const notificationData: NotificationData = {
          type: "friendRequest",
          id: newRequest.id,
          senderNickname: newRequest.senderNickname,
          avatarColor: newRequest.avatarColor,
          avatarImageUrl: newRequest.avatarImageUrl,
          message: newRequest.message,
          // isRead: false,
        };

        set((state) => ({
          notification: [...state.notification, notificationData],
          notificationHistory: [notificationData, ...state.notificationHistory],
          unReadNotification: true,
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

      // 새로운 메시지 알림 수신 이벤트
      newSocket.on("messageNotification", (newMessage) => {
        const notificationData: NotificationData = {
          type: "messageNotification",
          id: newMessage.id,
          roomTitle: newMessage.roomTitle,
          senderNickname: newMessage.senderNickname,
          avatarColor: newMessage.avatarColor,
          avatarImageUrl: newMessage.avatarImageUrl,
          message: newMessage.message,
          // isRead: false,
        };

        set((state) => ({
          notification: [...state.notification, notificationData],
          notificationHistory: [notificationData, ...state.notificationHistory],
          unReadNotification: true,
        }));

        setTimeout(() => {
          set((state) => ({
            notification: state.notification.filter(
              (notif) => notif.id !== newMessage.id
            ),
          }));
        }, 7000);
      });

      newSocket.on("groupChatInviteNotification", (groupChatInvite) => {
        const notificationData: NotificationData = {
          type: "groupChatInviteNotification",
          id: groupChatInvite.id,
          roomTitle: groupChatInvite.roomTitle,
          senderNickname: groupChatInvite.senderNickname,
          avatarColor: groupChatInvite.avatarColor,
          avatarImageUrl: groupChatInvite.avatarImageUrl,
          message: groupChatInvite.message,
          // isRead: false,
        };

        set((state) => ({
          notification: [...state.notification, notificationData],
          notificationHistory: [notificationData, ...state.notificationHistory],
          unReadNotification: true,
        }));

        setTimeout(() => {
          set((state) => ({
            notification: state.notification.filter(
              (notif) => notif.id !== groupChatInvite.id
            ),
          }));
        }, 7000);
      });

      set({ socket: newSocket });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("연결 오류 - 새로고침 후 다시 시도해주세요");
    }
  },

  readNotification: () => {
    set({
      unReadNotification: false,
    });
  },

  clearNotification: () => {
    set({
      notificationHistory: [],
      unReadNotification: false,
    });
  },

  // readNotification: () => {
  //   set((state) => ({
  //     notificationHistory: state.notificationHistory.map((notification) => ({
  //       ...notification,
  //       isRead: true,
  //     })),
  //   }));
  // },

  joinChatRoom: (roomId) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit("joinRoom", roomId); // 채팅방 입장
    set({ currentRoom: roomId });

    // 새로고침해도 유지되도록 localStorage에 저장
    localStorage.setItem("currentRoom", roomId);

    useChatStore.getState().newMessage(); // 메시지 수신 이벤트 등록 추가
  },

  // 방을 이동할 때 먼저 사용될 방 나가기 로직
  leaveChatRoom: () => {
    const socket = get().socket;
    if (!socket || !get().currentRoom) return;

    socket.emit("leaveRoom", get().currentRoom);
    set({ currentRoom: null });

    localStorage.removeItem("currentRoom");
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });

    // 로그아웃 시 채팅방 정보도 초기화
    localStorage.removeItem("currentRoom");
  },
}));

export default useSocketStore;
