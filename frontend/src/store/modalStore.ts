import { create } from "zustand";

import { ModalType } from "../types";

interface ModalStore {
  activeModal: ModalType | null;
  modalData: {
    method: "POST" | "PATCH";
    [key: string]: any;
  };
  toggleModal: (
    type: ModalType,
    method?: "POST" | "PATCH",
    data?: Record<string, any>
  ) => void;
}

const useModalStore = create<ModalStore>((set, get) => ({
  // 초기 상태: 모달 비활성화 상태 (null)
  activeModal: null,
  modalData: { method: "POST" },
  toggleModal: (type, method = "POST", data = {}) => {
    const currentModal = get().activeModal;

    if (currentModal === type) {
      set({ activeModal: null, modalData: { method: "POST" } });
    } else {
      set({ activeModal: type, modalData: { method, ...data } });
    }
  },
}));

export default useModalStore;
