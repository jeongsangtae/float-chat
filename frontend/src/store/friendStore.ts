import { create } from "zustand";

// import { io, Socket } from "socket.io-client";

const apiURL = import.meta.env.VITE_API_URL;

const useFriendStore = create((set) => ({
  // socket: null,
  // connect: () => {
  //   try {
  //     if (get().socket) return; // 이미 연결된 경우 중복 연결 방지

  //     const newSocket = io(`${apiURL}/friends`, {
  //       withCredentials: true, // CORS 설정
  //     });

  //     newSocket.on("connect", () => {
  //       console.log("친구 요청 소켓 연결됨:", newSocket.id);
  //     });

  //     // 친구 요청 수신 이벤트
  //     newSocket.on("friendRequest", (newRequest) => {
  //       set((state) => ({
  //         friendRequests: [...state.friendRequests, newRequest],
  //       }));
  //     });

  //     set({ socket: newSocket });

  //     // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
  //     return () => {
  //       newSocket.disconnect();
  //       console.log("친구 요청 소켓 연결 해제")
  //     };
  //   } catch (error) {
  //     console.error("에러 내용:", error);
  //     alert(
  //       "서버와의 연결 중 오류가 발생했습니다. 새로고침 후 다시 시도해 주세요."
  //     );
  //   }
  // },
  friends: [],
  friendRequests: [],
  statusMessage: "",
  loadFriends: async () => {
    try {
      const response = await fetch(`${apiURL}/friends`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 목록 조회 실패");
      }

      const resData = await response.json();

      console.log(resData.friends);

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

      const resData = await response.json();

      console.log(resData);

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

      if (!response.ok) {
        throw new Error("친구 요청 실패");
      }

      const resData = await response.json();

      console.log(resData.message);

      set({ statusMessage: resData.message });

      // set((state) => ({
      //   friendRequests: [
      //     ...state.friendRequests,
      //     { email: requestBody.searchUserEmail, status: "보류 중" },
      //   ],
      // }));
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

      const resData = await response.json();

      console.log(resData.acceptFriend);

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

      const resData = await response.json();

      console.log(resData.message);

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
  deleteFriend: async (friendId) => {
    try {
      const response = await fetch(`${apiURL}/deleteFriend/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("친구 삭제 실패");
      }

      const resData = await response.json();

      console.log(resData.message);

      // set((prevFriends) => ({
      //   friends: prevFriends.friends.filter((req) => req._id !== friendId),
      // }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 삭제 중 문제가 발생했습니다.");
    }
  },
}));

export default useFriendStore;
