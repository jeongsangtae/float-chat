import { create } from "zustand";

import { Socket } from "socket.io-client";

import useSocketStore from "./socketStore";

const apiURL = import.meta.env.VITE_API_URL;

const useDirectChatStore = create((set, get) => ({
  getDirectChat: async () => {},
  directChatForm: async () => {},
}));

export default useDirectChatStore;
