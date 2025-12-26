import { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import useModalStore from "../../store/modalStore";
import useDirectChatStore from "../../store/directChatStore";

import {
  ModalProps,
  MutualFriendUser,
  GroupChatData,
  DirectChatPayload,
} from "../../types";
// import Friend from "../Friends/Friend";
import Modal from "../UI/Modal";

interface GroupChatPayload {
  roomId: string;
}

type OpenChatPayload = DirectChatPayload | GroupChatPayload;

const UserProfileDetails = ({ onToggle }: ModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { modalData } = useModalStore();
  const { directChatForm } = useDirectChatStore();

  const [activeView, setActiveView] = useState<"friends" | "groups">(
    modalData.initialView ?? "friends"
  );

  console.log(modalData.mutualFriendUsers);
  // console.log(modalData.mutualGroupChats);

  const openChatHandler = async (payload: OpenChatPayload): Promise<void> => {
    console.log(payload);

    let targetPath = null;

    if (activeView === "friends") {
      if (!("id" in payload)) return;

      const { id, nickname, avatarColor, avatarImageUrl } = payload;

      console.log(id, nickname, avatarColor, avatarImageUrl);

      const roomId = await directChatForm(
        id,
        nickname,
        avatarColor,
        avatarImageUrl
      );

      targetPath = `/me/${roomId}`;
      // navigate(`/me/${roomId}`);
    } else {
      if (!("roomId" in payload)) return;

      targetPath = `/group-chat/${payload.roomId}`;
      // navigate(`/group-chat/${payload.roomId}`);
    }

    if (location.pathname === targetPath) {
      onToggle();
      return;
    }

    navigate(targetPath);
    onToggle();

    // const targetPath =
    //   activeView === "friends" ? `/me/${path}` : `/group-chat/${path}`;

    // // 이미 같은 경로면 이동하지 않고 모달창 닫기
    // if (location.pathname === targetPath) {
    //   onToggle();
    //   return;
    // }

    // navigate(targetPath);
    // onToggle();
  };

  const mutualFriendUsers: MutualFriendUser[] =
    modalData.mutualFriendUsers ?? [];
  const mutualGroupChats: GroupChatData[] = modalData.mutualGroupChats ?? [];

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
          {mutualFriendUsers.map((mutualFriendUser) => (
            <div
              key={mutualFriendUser.id}
              onClick={() =>
                openChatHandler({
                  id: mutualFriendUser.id,
                  nickname: mutualFriendUser.nickname,
                  avatarColor: mutualFriendUser.avatarColor,
                  avatarImageUrl: mutualFriendUser.avatarImageUrl,
                })
              }
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
          {mutualGroupChats.map((mutualGroupChat) => (
            <div
              key={mutualGroupChat._id}
              onClick={() => openChatHandler({ roomId: mutualGroupChat._id })}
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
