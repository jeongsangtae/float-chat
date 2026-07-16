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

  // Socket 연결 및 실시간 이벤트 등록
  connect: () => {
    try {
      const { userInfo } = useAuthStore.getState();
      if (!userInfo?._id) return;
      if (get().socket) return; // 이미 연결된 경우 중복 연결 방지

      const newSocket = io(`${apiURL}`, {
        withCredentials: true, // CORS 설정
      });

      // 연결 완료 후 사용자 등록 및 마지막 채팅방 자동 입장
      newSocket.on("connect", () => {
        // 현재 사용자를 소켓 서버에 등록
        newSocket.emit("registerUser", userInfo?._id);

        // 새로고침 후 자동으로 마지막 채팅방 다시 입장
        const lastRoom = localStorage.getItem("currentRoom");
        if (lastRoom) {
          get().joinChatRoom(lastRoom);
        }
      });

      // 토스트 알림 및 알림 기록 공통 처리
      const addNotification = (notificationData: NotificationData) => {
        set((state) => ({
          notification: [...state.notification, notificationData],
          notificationHistory: [notificationData, ...state.notificationHistory], // 최신 알림을 가장 앞에 추가
          unReadNotification: true,
        }));

        // 일정 시간 후 토스트 알림 제거 (알림 기록은 유지)
        setTimeout(() => {
          set((state) => ({
            notification: state.notification.filter(
              (notif) => notif.id !== notificationData.id
            ),
          }));
        }, 7000);
      };

      // 친구 요청 알림 수신 이벤트
      newSocket.on("friendRequest", (newRequest) => {
        // 친구 요청 알림 데이터 생성
        const notificationData: NotificationData = {
          type: "friendRequest",
          id: newRequest.id,
          senderNickname: newRequest.senderNickname,
          avatarColor: newRequest.avatarColor,
          avatarImageUrl: newRequest.avatarImageUrl,
          message: newRequest.message,
          // isRead: false,
        };

        addNotification(notificationData);

        useFriendStore.getState().loadFriendRequests();
      });

      // 새로운 메시지 알림 수신 이벤트
      newSocket.on("messageNotification", (newMessage) => {
        // 메시지 알림 데이터 생성
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

        addNotification(notificationData);
      });

      newSocket.on("groupChatInviteNotification", (groupChatInvite) => {
        // 그룹 채팅 초대 알림 데이터 생성
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

        addNotification(notificationData);
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

  // 읽은 알림 처리 기능 (추후 사용 예정)
  // 현재는 사용하지 않아 비활성화
  // readNotification: () => {
  //   set((state) => ({
  //     notificationHistory: state.notificationHistory.map((notification) => ({
  //       ...notification,
  //       isRead: true,
  //     })),
  //   }));
  // },

  // 채팅방 입장 및 현재 방 정보 저장
  joinChatRoom: (roomId) => {
    const socket = get().socket;
    if (!socket) return;

    socket.emit("joinRoom", roomId); // 채팅방 입장
    set({ currentRoom: roomId });

    // 새로고침해도 유지되도록 localStorage에 저장
    localStorage.setItem("currentRoom", roomId);

    useChatStore.getState().newMessage(); // 메시지 수신 이벤트 등록 추가
  },

  // 현재 참여 중인 채팅방에서 퇴장
  leaveChatRoom: () => {
    const socket = get().socket;
    if (!socket || !get().currentRoom) return;

    socket.emit("leaveRoom", get().currentRoom);
    set({ currentRoom: null });

    localStorage.removeItem("currentRoom");
  },

  // Socket 연결 종료 및 채팅방 정보 초기화
  disconnect: () => {
    get().socket?.disconnect();
    set({ socket: null });

    // 로그아웃 시 채팅방 정보도 초기화
    localStorage.removeItem("currentRoom");
  },
}));

export default useSocketStore;
