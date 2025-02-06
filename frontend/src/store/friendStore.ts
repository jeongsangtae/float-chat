import { create } from "zustand";

const apiURL = import.meta.env.VITE_API_URL;

const useFriendStore = create((set) => ({
  friends: [],
  friendRequests: [],
  statusMessage: "",
  sendFriendRequest: async (userInfo, searchUserEmail) => {
    const requestBody = {
      _id: userInfo._id,
      email: userInfo.email,
      username: userInfo.username,
      nickname: userInfo.nickname,
      searchUserEmail,
    };

    try {
      const response = await fetch(`${apiURL}/addFriend`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const resData = await response.json();

      console.log(resData.message);

      set({ statusMessage: resData.message });

      set((state) => ({
        friendRequests: [
          ...state.friendRequests,
          { email: requestBody.searchUserEmail, status: "보류 중" },
        ],
      }));
    } catch (error) {
      console.error("에러 내용:", error);
      alert("친구 추가 요청 중 문제가 발생했습니다.");
    }
  },
}));

export default useFriendStore;
