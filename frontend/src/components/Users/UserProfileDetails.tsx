// import useModalStore from "../../store/modalStore";
import { useState } from "react";
import useModalStore from "../../store/modalStore";
import { ModalProps } from "../../types";
import Modal from "../UI/Modal";

const UserProfileDetails = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();

  const [activeView, setActiveView] = useState<"friends" | "groups">(
    modalData.initialView ?? "friends"
  );

  console.log(modalData);

  return (
    <Modal onToggle={onToggle}>
      {/* <div>
        {modalData.mutualFriends.map((mutualFriend) => {
          mutualFriend;
        })}
      </div>
      <div>
        {modalData.mutualGroupChats.map((mutualGroupChat) => {
          mutualGroupChat;
        })}
      </div> */}
    </Modal>
  );
};

export default UserProfileDetails;
