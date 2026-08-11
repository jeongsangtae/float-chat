import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

import classes from "./GroupMemberActionConfirm.module.css";

const GroupMemberActionConfirm = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();
  const { transferHost, grantAdmin } = useGroupChatStore();

  const confirmHandler = async () => {
    if (modalData.type === "transfer") {
      await transferHost(modalData.roomId, modalData.targetUserId);
    }

    if (modalData.type === "grantAdmin") {
      await grantAdmin(modalData.roomId, modalData.targetUserId);
    }

    onToggle();
  };

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["group-member-action-confirm"]}>
        <h2 className={classes.title}>
          {modalData.type === "transfer" && "호스트 권한 위임"}
          {modalData.type === "grantAdmin" && "관리자 권한 부여"}
          {modalData.type === "revokeAdmin" && "관리자 권한 회수"}
          {modalData.type === "kickMember" && "멤버 강제 퇴장"}
        </h2>
        <p className={classes.message}>
          정말 {modalData.type === "transfer" && "호스트 권한을 위임"}
          {modalData.type === "grantAdmin" && "관리자 권한을 부여"}
          {modalData.type === "revokeAdmin" && "관리자 권한을 회수"}
          {modalData.type === "kickMember" && "멤버를 강제 퇴장"}하시겠습니까?
        </p>
        <div className={classes["button-wrapper"]}>
          <button
            className={classes["confirm-button"]}
            onClick={confirmHandler}
          >
            {modalData.type === "transfer" && "위임"}
            {modalData.type === "grantAdmin" && "부여"}
            {modalData.type === "revokeAdmin" && "회수"}
            {modalData.type === "kickMember" && "퇴장"}
          </button>
          <button className={classes["cancel-button"]} onClick={onToggle}>
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GroupMemberActionConfirm;
