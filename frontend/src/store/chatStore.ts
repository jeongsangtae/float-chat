import { create } from "zustand";

const useChatStore = create((set, get) => ({
  chatData: () => {},
  sendMessage: () => {},
}));

export default useChatStore;
