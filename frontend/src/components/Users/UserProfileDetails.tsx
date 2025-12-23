import { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import useModalStore from "../../store/modalStore";

import { ModalProps } from "../../types";
import Friend from "../Friends/Friend";
import Modal from "../UI/Modal";

const UserProfileDetails = ({ onToggle }: ModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { modalData } = useModalStore();

  const [activeView, setActiveView] = useState<"friends" | "groups">(
    modalData.initialView ?? "friends"
  );

  console.log(modalData.mutualFriendUsers);
  console.log(modalData.mutualGroupChats);

  const chatHandler = (path: string) => {
    const targetPath =
      activeView === "friends" ? `/me/${path}` : `/group-chat/${path}`;

    // 이미 같은 경로면 이동하지 않고 모달창 닫기
    if (location.pathname === targetPath) {
      onToggle();
      return;
    }

    navigate(targetPath);
    onToggle();
  };

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
          {modalData.mutualFriendUsers?.map((mutualFriendUser) => (
            <div
              key={mutualFriendUser.id}
              onClick={() => chatHandler(mutualFriendUser.roomId)}
            >
              <div>{mutualFriendUser.nickname}</div>
              {/* <div>{mutualFriendUser.onlineChecked}</div> */}
              {/* <div>{mutualFriendUser.avatarImageUrl}</div> */}
            </div>
          ))}
        </div>
      )}

      {activeView === "groups" && (
        <div>
          {modalData.mutualGroupChats?.map((mutualGroupChat) => (
            <div
              key={mutualGroupChat._id}
              onClick={() => chatHandler(mutualGroupChat._id)}
            >
              <div>{mutualGroupChat.title}</div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default UserProfileDetails;
