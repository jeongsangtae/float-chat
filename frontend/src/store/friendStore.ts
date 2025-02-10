import { create } from "zustand";

const apiURL = import.meta.env.VITE_API_URL;

const useFriendStore = create((set) => ({
  friends: [],
  friendRequests: [],
  statusMessage: "",
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
      const response = await fetch(`${apiURL}/rejectFriend`, {
        method: "POST",
        body: JSON.stringify({ friendRequestId }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const resData = await response.json();

      console.log(resData.friendRequests);

      set({ friendRequests: resData.friendRequests });
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 거절 중 문제가 발생했습니다.");
    }
  },
}));

export default useFriendStore;
