import { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useModalStore from "../../store/modalStore";
import useFriendStore from "../../store/friendStore";

import Avatar from "./Avatar";
import {
  ModalProps,
  MutualFriendUser,
  GroupChatData,
  DirectChatPayload,
} from "../../types";
import Modal from "../UI/Modal";

import { getDirectChatRoomId } from "../../utils/getDirectChatRoomId";

import classes from "./UserProfileDetails.module.css";

interface GroupChatPayload {
  roomId: string;
}

type OpenChatPayload = DirectChatPayload | GroupChatPayload;

const UserProfileDetails = ({ onToggle }: ModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useAuthStore();
  const { modalData } = useModalStore();
  const { sendFriendRequest } = useFriendStore();
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

  const addFriendHandler = async (): Promise<void> => {
    // const userInfo = {
    //   _id: modalData.userId,
    //   email: modalData.email,
    //   username: modalData.username,
    //   nickname: modalData.nickname,
    //   avatarColor: modalData.avatarColor,
    //   avatarImageUrl: modalData.avatarImageUrl,
    // };
    if (!userInfo) {
      alert("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
      return;
    }

    await sendFriendRequest(userInfo, modalData.email);
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
            {modalData.friendSince ? (
              <div>
                <div>
                  <span>📅</span>친구 시작일:
                </div>
                <div>{modalData.friendSince}</div>
              </div>
            ) : (
              <div>친구가 아닌 사용자</div>
            )}
            {modalData.friendSince ? (
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
            ) : (
              <div>
                <button onClick={addFriendHandler}>친구 추가 아이콘</button>
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
              </div>
            )}
          </div>
        </div>
        <div className={classes["user-profile-details-mutual-wrapper"]}>
          <div className={classes["user-profile-details-mutual-tabs"]}>
            <button
              className={`${classes["user-profile-details-mutual-tab"]} ${
                activeView === "friends" ? classes.active : ""
              }`}
              onClick={() => setActiveView("friends")}
            >
              같이 아는 친구 {mutualFriendUsers.length}명
            </button>

            <button
              className={`${classes["user-profile-details-mutual-tab"]} ${
                activeView === "groups" ? classes.active : ""
              }`}
              onClick={() => setActiveView("groups")}
            >
              같이 있는 그룹 채팅방 {mutualGroupChats.length}개
            </button>
          </div>
          {activeView === "friends" && (
            <div>
              {mutualFriendUsers.map((mutualFriendUser) => (
                <div
                  className={classes["user-profile-details-mutual-friend"]}
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
                  <Avatar
                    nickname={mutualFriendUser.nickname}
                    avatarImageUrl={mutualFriendUser.avatarImageUrl}
                    avatarColor={mutualFriendUser.avatarColor}
                    onlineChecked={mutualFriendUser.onlineChecked}
                    showOnlineDot={true}
                  />
                  {/* {mutualFriendUser.avatarImageUrl ? (
                    <img src={mutualFriendUser.avatarImageUrl} />
                  ) : (
                    <div
                      style={{
                        backgroundColor: mutualFriendUser.avatarColor || "#ccc",
                      }}
                    >
                      {mutualFriendUser.nickname.charAt(0)}
                    </div>
                  )}
                  <div
                    className={
                      mutualFriendUser.onlineChecked
                        ? classes["user-profile-info-online-dot"]
                        : classes["user-profile-info-offline-dot"]
                    }
                  /> */}
                  <div
                    className={
                      classes["user-profile-details-mutual-friend-nickname"]
                    }
                  >
                    {mutualFriendUser.nickname}
                  </div>
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
                  <div></div>
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
