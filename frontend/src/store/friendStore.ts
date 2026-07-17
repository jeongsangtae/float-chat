import { create } from "zustand";
import { toast } from "react-toastify";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

import { UserInfo, Friend, FriendRequest } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface FriendStore {
  socket: Socket | null;
  onlineFriends: Friend[];
  friends: Friend[];
  otherUserFriends: Friend[];
  friendRequests: FriendRequest[];
  status: number;
  statusMessage: string;
  resetStatusMessage: () => void;
  loadOnlineFriends: () => Promise<void>;
  loadFriends: () => Promise<void>;
  loadOtherUserFriends: (otherUserId: string) => Promise<void>;
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
  onlineFriends: [],
  friends: [],
  otherUserFriends: [],
  friendRequests: [],
  status: 0,
  statusMessage: "",

  // 상태 메시지 초기화
  resetStatusMessage: () => {
    set({ statusMessage: "" });
  },

  // 온라인 친구 목록 조회 및 실시간 이벤트 등록
  loadOnlineFriends: async () => {
    try {
      const response = await fetch(`${apiURL}/onlineFriends`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("온라인 친구 목록 조회 실패");
      }

      const socket = useSocketStore.getState().socket;
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("friendProfileUpdated");

      // 친구가 프로필을 업데이트했을 경우 실시간 반영
      socket.on(
        "friendProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            onlineFriends: prev.onlineFriends.map((onlineFriend) => {
              // 프로필을 변경한 사용자가 요청자인지 수신자인지 확인
              const isRequester = onlineFriend.requester.id === userId;
              const isReceiver = onlineFriend.receiver.id === userId;

              // 닉네임을 바꾼 대상이 아니면 원본 그대로 반환
              if (!isRequester && !isReceiver) return onlineFriend;

              // 닉네임을 바꾼 대상만 업데이트하고 나머지는 그대로 유지
              return {
                ...onlineFriend,
                requester: isRequester
                  ? {
                      ...onlineFriend.requester,
                      nickname: newNickname,
                      avatarColor: newAvatarColor,
                      avatarImageUrl: newAvatarImageUrl,
                    }
                  : onlineFriend.requester,
                receiver: isReceiver
                  ? {
                      ...onlineFriend.receiver,
                      nickname: newNickname,
                      avatarColor: newAvatarColor,
                      avatarImageUrl: newAvatarImageUrl,
                    }
                  : onlineFriend.receiver,
              };
            }),
          }));
        }
      );

      socket.off("onlineFriend");

      // 온라인 상태로 변경된 친구를 실시간 반영해 업데이트
      // 이미 존재하는 친구는 중복 추가하지 않음
      socket.on("onlineFriend", (onlineFriendData) => {
        set((prev) => ({
          onlineFriends: prev.onlineFriends.some(
            (friend) => friend._id === onlineFriendData._id
          )
            ? prev.onlineFriends
            : [...prev.onlineFriends, onlineFriendData],
        }));
      });

      socket.off("offlineFriend");

      // 오프라인 상태로 변경된 친구를 실시간 반영해 업데이트
      socket.on("offlineFriend", (offlineFriendData) => {
        set((prev) => ({
          onlineFriends: prev.onlineFriends.filter(
            (friend) => friend._id !== offlineFriendData._id
          ),
        }));
      });

      const resData = await response.json();
      set({ onlineFriends: resData.onlineFriends });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 친구 목록 조회 및 실시간 이벤트 등록
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
      socket.off("friendProfileUpdated");

      socket.on(
        "friendProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            friends: prev.friends.map((friend) => {
              // 요청자와 수신자 중 누가 닉네임을 바꿨는지 확인
              const isRequester = friend.requester.id === userId;
              const isReceiver = friend.receiver.id === userId;

              // 닉네임을 바꾼 대상이 아니면 원본 그대로 반환
              if (!isRequester && !isReceiver) return friend;

              // 닉네임을 바꾼 대상만 업데이트하고 나머지는 그대로 유지
              return {
                ...friend,
                requester: isRequester
                  ? {
                      ...friend.requester,
                      nickname: newNickname,
                      avatarColor: newAvatarColor,
                      avatarImageUrl: newAvatarImageUrl,
                    }
                  : friend.requester,
                receiver: isReceiver
                  ? {
                      ...friend.receiver,
                      nickname: newNickname,
                      avatarColor: newAvatarColor,
                      avatarImageUrl: newAvatarImageUrl,
                    }
                  : friend.receiver,
              };
            }),
          }));
        }
      );

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("friendAdd");

      // 새 친구를 목록에 추가
      socket.on("friendAdd", (newFriend) => {
        // concat 사용한 로직
        // set((prev) => ({
        //   friends: prev.friends.concat(newFriend),
        // }));

        set((prev) => ({
          friends: [...prev.friends, newFriend],
        }));
      });

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("friendDelete");

      // 삭제한 친구를 상대방 화면에 실시간 반영
      // 요청자/수신자 관계를 확인하여 해당 친구만 제거
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
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 다른 사용자의 친구 목록 조회
  loadOtherUserFriends: async (otherUserId) => {
    try {
      const response = await fetch(
        `${apiURL}/otherUserFriends/${otherUserId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("다른 사용자 친구 요청 조회 실패");
      }

      const resData: { otherUserFriends: Friend[] } = await response.json();

      set({ otherUserFriends: resData.otherUserFriends });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 친구 요청 목록 조회 및 실시간 이벤트 등록
  loadFriendRequests: async () => {
    try {
      const response = await fetch(`${apiURL}/friendRequests`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 요청 조회 실패");
      }

      const socket = useSocketStore.getState().socket;
      if (!socket) return; // 소켓이 없으면 실행 안 함

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("friendRequestProfileUpdated");

      // 친구 요청 대기중 사용자 닉네임이 변경되면 실시간 반영해 업데이트
      socket.on(
        "friendRequestProfileUpdated",
        ({ userId, newNickname, newAvatarColor, newAvatarImageUrl }) => {
          set((prev) => ({
            friendRequests: prev.friendRequests.map((friendRequest) => {
              const updatedFriendRequest = { ...friendRequest };

              // 요청자 또는 수신자의 프로필 정보만 업데이트
              if (friendRequest.requester === userId) {
                updatedFriendRequest.requesterNickname = newNickname;
                updatedFriendRequest.requesterAvatarColor = newAvatarColor;
                updatedFriendRequest.requesterAvatarImageUrl =
                  newAvatarImageUrl;
              } else if (friendRequest.receiver === userId) {
                updatedFriendRequest.receiverNickname = newNickname;
                updatedFriendRequest.receiverAvatarColor = newAvatarColor;
                updatedFriendRequest.receiverAvatarImageUrl = newAvatarImageUrl;
              }
              return updatedFriendRequest;
            }),
          }));
        }
      );

      const removeFriendRequest = (friendRequestId: string) => {
        set((prev) => ({
          friendRequests: prev.friendRequests.filter(
            (request) => request._id !== friendRequestId
          ),
        }));
      };

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("acceptFriend");

      // 수락한 친구 요청을 상대방 화면에 실시간 반영
      socket.on("acceptFriend", removeFriendRequest);

      // 기존 이벤트 리스너 제거 후 재등록 (중복 방지)
      socket.off("rejectFriend");

      // 거절한 친구 요청을 상대방 화면에 실시간 반영
      socket.on("rejectFriend", removeFriendRequest);

      const resData: { friendRequests: FriendRequest[] } =
        await response.json();

      set({ friendRequests: resData.friendRequests });
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("불러오기 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 친구 요청 전송
  sendFriendRequest: async (userInfo, searchUserEmail) => {
    const requestBody = {
      _id: userInfo._id,
      email: userInfo.email,
      username: userInfo.username,
      nickname: userInfo.nickname,
      avatarColor: userInfo.avatarColor,
      avatarImageUrl: userInfo.avatarImageUrl,
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
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("요청 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 친구 요청 수락
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

      // 수락한 요청을 현재 목록에서 제거
      set((prevFriendRequests) => ({
        friendRequests: prevFriendRequests.friendRequests.filter(
          (req) => req._id !== friendRequestId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("수락 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 친구 요청 거절 또는 취소
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

      // 처리 완료된 요청을 현재 목록에서 제거
      set((prevFriendRequests) => ({
        friendRequests: prevFriendRequests.friendRequests.filter(
          (req) => req._id !== friendRequestId
        ),
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      toast.error("처리 실패 - 새로고침 후 다시 시도해주세요");
    }
  },

  // 친구 삭제
  deleteFriend: async (friendId, userId) => {
    try {
      const response = await fetch(`${apiURL}/deleteFriend/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 삭제 실패");
      }

      // 요청자/수신자 관계를 확인하여 삭제한 친구 제거
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
      toast.error("삭제 실패 - 새로고침 후 다시 시도해주세요");
    }
  },
}));

export default useFriendStore;
