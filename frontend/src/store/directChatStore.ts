import { create } from "zustand";

import { Socket } from "socket.io-client";

// import useSocketStore from "./socketStore";

import { DirectChatData } from "../types";

const apiURL = import.meta.env.VITE_API_URL;

interface DirectChatStore {
  socket: Socket | null;
  directChats: DirectChatData[];
  // directChatRoomId: string;
  getDirectChat: () => Promise<void>;
  directChatForm: (id: string, nickname: string) => Promise<void>;
}

const useDirectChatStore = create<DirectChatStore>((set) => ({
  socket: null,
  directChats: [],
  // directChatRoomId: "",

  getDirectChat: async () => {
    const response = await fetch(`${apiURL}/directChats`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다이렉트 채팅방 조회 실패`);
    }

    const resData: { directChats: DirectChatData[] } = await response.json();

    set({ directChats: resData.directChats });
  },

  directChatForm: async (id, nickname) => {
    const requestBody = { id, nickname };

    const response = await fetch(`${apiURL}/directChatForm`, {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다이렉트 채팅방 생성 실패`);
    }

    const resData = await response.json();

    // set({ directChatRoomId: resData.roomId });

    return resData.roomId;
  },

  closeDirectChat: async (_id) => {
    const response = await fetch(`${apiURL}/closeDirectChat/${_id}`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("다이렉트 채팅방 닫기 실패");
    }

    // const updatedDirectChats = get().directChats.filter(
    //   (directChat: DirectChatData) => directChat._id !== _id
    // );

    // set({ directChats: updatedDirectChats });
  },
}));

export default useDirectChatStore;
