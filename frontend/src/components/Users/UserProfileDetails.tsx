import { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import useModalStore from "../../store/modalStore";
// import useDirectChatStore from "../../store/directChatStore";

import classes from "./UserProfileDetails.module.css";

import {
  ModalProps,
  MutualFriendUser,
  GroupChatData,
  DirectChatPayload,
} from "../../types";
// import Friend from "../Friends/Friend";
import Modal from "../UI/Modal";
import { getDirectChatRoomId } from "../../utils/getDirectChatRoomId";

interface GroupChatPayload {
  roomId: string;
}

type OpenChatPayload = DirectChatPayload | GroupChatPayload;

const UserProfileDetails = ({ onToggle }: ModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { modalData } = useModalStore();
  // const { directChatForm } = useDirectChatStore();

  const [activeView, setActiveView] = useState<"friends" | "groups">(
    modalData.initialView ?? "friends"
  );

  console.log(modalData);

  const openChatHandler = async (payload: OpenChatPayload): Promise<void> => {
    console.log(payload);

    let targetPath = null;

    if (activeView === "friends") {
      if (!("id" in payload)) return;

      const roomId = await getDirectChatRoomId(payload);

      targetPath = `/me/${roomId}`;
    } else {
      if (!("roomId" in payload)) return;

      targetPath = `/group-chat/${payload.roomId}`;
    }

    if (location.pathname === targetPath) {
      onToggle();
      return;
    }

    navigate(targetPath);
    onToggle();
  };

  const openDirectChatHandler = async (
    payload: DirectChatPayload
  ): Promise<void> => {
    console.log(payload);

    const roomId = await getDirectChatRoomId(payload);

    navigate(`/me/${roomId}`);

    onToggle();
  };

  const mutualFriendUsers: MutualFriendUser[] =
    modalData.mutualFriendUsers ?? [];
  const mutualGroupChats: GroupChatData[] = modalData.mutualGroupChats ?? [];

  return (
    <Modal onToggle={onToggle}>
      <div className={classes["user-profile-details-wrapper"]}>
        <div className={classes["user-profile-details-info-wrapper"]}>
          <div>
            {modalData.avatarImageUrl ? (
              <img
                className={classes["user-profile-details-info-header-img"]}
                src={modalData.avatarImageUrl}
              />
            ) : (
              <div
                className={classes["user-profile-details-info-header-color"]}
                style={{ backgroundColor: modalData.avatarColor || "#ccc" }}
              ></div>
            )}

            <div
              className={classes["user-profile-details-info-avatar-wrapper"]}
            >
              {modalData.avatarImageUrl ? (
                <img
                  className={classes["user-profile-details-info-avatar-img"]}
                  src={modalData.avatarImageUrl}
                />
              ) : (
                <div
                  className={classes["user-profile-details-info-avatar-color"]}
                  style={{ backgroundColor: modalData.avatarColor || "#ccc" }}
                >
                  {modalData.nickname.charAt(0)}
                </div>
              )}
              <div
                className={
                  modalData.onlineChecked
                    ? classes["user-profile-details-info-online-dot"]
                    : classes["user-profile-details-info-offline-dot"]
                }
              />
            </div>
          </div>
          <div className={classes["user-profile-details-info-content"]}>
            <div>{modalData.nickname}</div>
            <div>친구가 된 날짜 출력하는 공간</div>
            <div>
              <button
                onClick={() =>
                  openDirectChatHandler({
                    id: modalData.userId,
                    nickname: modalData.nickname,
                    avatarColor: modalData.avatarColor,
                    avatarImageUrl: modalData.avatarImageUrl,
                  })
                }
              >
                메시지
              </button>
              <div>친구 아이콘</div>
            </div>
          </div>
        </div>
        <div className={classes["user-profile-details-mutual-wrapper"]}>
          <div className={classes["user-profile-details-mutual-tabs"]}>
            <button
              className={`${classes["user-profile-details-mutual-tab"]} ${
                activeView === "friends" ? classes.active : ""
              }`}
              onClick={() => setActiveView("friends")}
              // disabled={activeView === "friends"}
            >
              같이 아는 친구 {mutualFriendUsers.length}명
            </button>
            <button
              className={`${classes["user-profile-details-mutual-tab"]} ${
                activeView === "groups" ? classes.active : ""
              }`}
              onClick={() => setActiveView("groups")}
              // disabled={activeView === "groups"}
            >
              같이 있는 그룹 채팅방 {mutualGroupChats.length}개
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
                  onClick={() =>
                    openChatHandler({ roomId: mutualGroupChat._id })
                  }
                >
                  <div>{mutualGroupChat.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileDetails;
