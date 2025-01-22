import { create } from "zustand";

import { ModalProps } from "../types";

type ModalType = "login" | "signup" | "groupChatForm";
// type ModalStore = {
//   activeModal: ModalType | null;
//   modalData: Record<string, any>;
//   toggleModal: (
//     type: ModalType,
//     method?: string,
//     data?: Record<string, any>
//   ) => void;
// };

interface ModalStore {
  activeModal: ModalType | null;
  modalData: {
    method: "POST" | "PATCH" | null;
    [key: string]: any;
  };
  toggleModal: (
    type: ModalType,
    method?: "POST" | "PATCH" | null,
    data?: Record<string, any>
  ) => void;
}

const useModalStore = create<ModalStore>((set, get) => ({
  activeModal: null,
  modalData: { method: null },
  toggleModal: (type, method = null, data = {}) => {
    const currentModal = get().activeModal;

    if (currentModal === type) {
      set({ activeModal: null, modalData: { method: null } });
    } else {
      set({ activeModal: type, modalData: { method, ...data } });
    }
  },
}));

export default useModalStore;
