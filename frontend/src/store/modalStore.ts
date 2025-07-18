import { create } from "zustand";

interface ModalStore {
  activeModal: "groupChatForm" | "editUserProfileForm" | null;
  modalData: {
    method: "POST" | "PATCH";
    [key: string]: any;
  };
  toggleModal: (
    type: "groupChatForm" | "editUserProfileForm",
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
