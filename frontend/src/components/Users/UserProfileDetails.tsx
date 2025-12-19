import { useState } from "react";

import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Friend from "../Friends/Friend";
import Modal from "../UI/Modal";

const UserProfileDetails = ({ onToggle }: ModalProps) => {
  const { modalData } = useModalStore();

  const [activeView, setActiveView] = useState<"friends" | "groups">(
    modalData.initialView ?? "friends"
  );

  console.log(modalData.mutualFriendUsers);
  // console.log(modalData.mutualGroupChats);

  return (
    <Modal onToggle={onToggle}>
      <div>
        <button
          onClick={() => setActiveView("friends")}
          disabled={activeView === "friends"}
        >
          같이 아는 친구
        </button>
        <button
          onClick={() => setActiveView("groups")}
          disabled={activeView === "groups"}
        >
          같이 있는 그룹 채팅방
        </button>
      </div>
      {activeView === "friends" && (
        <div>
          <div>테스트 내용</div>
          {modalData.mutualFriends?.map((mutualFriend) => (
            <div key={mutualFriend._id}>
              <div>내용</div>
              {/* <div>{mutualFriend.nickname}</div>
              <div>{mutualFriend.avatarImageUrl}</div> */}
            </div>
          ))}
        </div>
      )}

      {activeView === "groups" && (
        <div>
          <div>테스트 내용2</div>
          {modalData.mutualGroupChats?.map((mutualGroupChat) => (
            <div key={mutualGroupChat._id}>
              <div>{mutualGroupChat.title}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default UserProfileDetails;
