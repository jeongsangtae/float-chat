import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

const apiURL = import.meta.env.VITE_API_URL;

const useDirectChatStore = create((set, get) => ({
  directChats: [],
  getDirectChat: async () => {
    const response = await fetch(`${apiURL}/directChats`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다이렉트 채팅방 조회 실패`);
    }

    const resData = await response.json();

    set({ directChats: resData.directChats });
  },

  directChatForm: async (id) => {
    const response = await fetch(`${apiURL}/directChatForm`, {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다이렉트 채팅방 생성 실패`);
    }

    const resData = await response.json();

    console.log(resData);
  },
}));

export default useDirectChatStore;
