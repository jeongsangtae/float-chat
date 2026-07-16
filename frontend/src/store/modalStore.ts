import { create } from "zustand";

type ModalType =
  | "userSettings"
  | "editUserProfileForm"
  | "editUserPasswordForm"
  | "userProfileDetails"
  | "groupChatForm"
  | "groupChatConfirm"
  | "groupChatAnnouncementForm"
  | "groupChatAnnouncementDelete";

interface ModalStore {
  activeModal: ModalType | null;
  modalData: {
    method: "POST" | "PATCH" | "DELETE";
    [key: string]: any;
  };
  toggleModal: (
    type: ModalType,
    method?: "POST" | "PATCH" | "DELETE",
    data?: Record<string, any>
  ) => void;
}

const useModalStore = create<ModalStore>((set, get) => ({
  // 초기 상태: 모달 비활성화 상태
  activeModal: null,
  modalData: { method: "POST" },

  // 같은 모달이면 닫고, 다른 모달이면 데이터와 함께 열기
  toggleModal: (type, method = "POST", data = {}) => {
    const currentModal = get().activeModal;

    // 같은 모달을 다시 요청하면 닫기
    if (currentModal === type) {
      // 이미 열려 있는 모달이면 닫기
      set({ activeModal: null, modalData: { method: "POST" } });
    } else {
      // 선택한 모달 열기
      set({ activeModal: type, modalData: { method, ...data } });
    }
  },
}));

export default useModalStore;
