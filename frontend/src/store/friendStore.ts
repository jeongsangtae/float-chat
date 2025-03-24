import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import { UserInfo, Friend, FriendRequest } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface FriendStore {
  socket: Socket | null;
  friends: Friend[];
  friendRequests: FriendRequest[];
  status: number;
  statusMessage: string;
  resetStatusMessage: () => void;
  loadFriends: () => Promise<void>;
  loadFriendRequests: () => Promise<void>;
  sendFriendRequest: (
    userInfo: Omit<UserInfo, "tokenExp">, // tokenExp를 제외하고 사용
    searchUserEmail: string
  ) => Promise<void>;
  acceptFriendRequest: (friendRequestId: string) => Promise<void>;
  rejectFriendRequest: (friendRequestId: string) => Promise<void>;
  deleteFriend: (friendId: string, userId: string) => Promise<void>;
}

const useFriendStore = create<FriendStore>((set) => ({
  socket: null,
  friends: [],
  friendRequests: [],
  status: 0,
  statusMessage: "",
  resetStatusMessage: () => {
    set({ statusMessage: "" });
  },

  loadFriends: async () => {
    try {
      const response = await fetch(`${apiURL}/friends`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 목록 조회 실패");
      }

      const socket = useSocketStore.getState().socket;
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("friendDelete");

      // 삭제한 친구를 상대방 화면에 실시간 반영
      socket.on("friendDelete", ({ userId, friendId }) => {
        set((prev) => ({
          friends: prev.friends.filter((friend: Friend) => {
            return !(
              (friend.requester.id === friendId &&
                friend.receiver.id === userId) ||
              (friend.requester.id === userId &&
                friend.receiver.id === friendId)
            );
          }),
        }));
      });

      const resData: { friends: Friend[] } = await response.json();

      set({ friends: resData.friends });
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 목록 조회 중 문제가 발생했습니다.");
    }
  },

  loadFriendRequests: async () => {
    try {
      const response = await fetch(`${apiURL}/friendRequests`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 요청 조회 실패");
      }

      const resData: { friendRequests: FriendRequest[] } =
        await response.json();

      set({ friendRequests: resData.friendRequests });
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 추가 요청 조회 중 문제가 발생했습니다.");
    }
  },

  sendFriendRequest: async (userInfo, searchUserEmail) => {
    const requestBody = {
      _id: userInfo._id,
      email: userInfo.email,
      username: userInfo.username,
      nickname: userInfo.nickname,
      searchUserEmail,
    };

    try {
      const response = await fetch(`${apiURL}/friendRequests`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const resData = await response.json();

      set({ status: response.status, statusMessage: resData.message });

      // get().loadFriendRequests();
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 추가 요청 중 문제가 발생했습니다.");
    }
  },

  acceptFriendRequest: async (friendRequestId) => {
    try {
      const response = await fetch(`${apiURL}/acceptFriend`, {
        method: "POST",
        body: JSON.stringify({ friendRequestId }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 요청 수락 실패");
      }

      // const resData = await response.json();

      // console.log(resData.acceptFriend);

      set((prevFriendRequests) => ({
        friendRequests: prevFriendRequests.friendRequests.filter(
          (req) => req._id !== friendRequestId
        ),
      }));
      // set({ friendRequests: resData.acceptFriend });
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 수락 중 문제가 발생했습니다.");
    }
  },

  rejectFriendRequest: async (friendRequestId) => {
    try {
      const response = await fetch(
        `${apiURL}/rejectFriend/${friendRequestId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("친구 요청 취소 또는 거절 실패");
      }

      // const resData = await response.json();

      // console.log(resData.message);

      // set({ friendRequests: resData.friendRequests });
      set((prevFriendRequests) => ({
        friendRequests: prevFriendRequests.friendRequests.filter(
          (req) => req._id !== friendRequestId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 취소 또는 거절 중 문제가 발생했습니다.");
    }
  },

  deleteFriend: async (friendId, userId) => {
    try {
      const response = await fetch(`${apiURL}/deleteFriend/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 삭제 실패");
      }

      // const resData = await response.json();

      // console.log(resData.message);

      // set((prevFriends) => ({
      //   friends: prevFriends.friends.filter(
      //     (friend) => friend._id !== friendId
      //   ),
      // }));
      set((prevFriends) => ({
        friends: prevFriends.friends.filter((friend) => {
          return !(
            (friend.requester.id === friendId &&
              friend.receiver.id === userId) ||
            (friend.requester.id === userId && friend.receiver.id === friendId)
          );
        }),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 삭제 중 문제가 발생했습니다.");
    }
  },
}));

export default useFriendStore;
