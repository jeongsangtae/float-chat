import { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { UserRoundCheck, UserRoundPlus, MessageCircleMore } from "lucide-react";

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

  const [activeView, setActiveView] = useState<"friends" | "groups">(
    modalData.initialView ?? "friends"
  );

  const openChatHandler = async (payload: OpenChatPayload): Promise<void> => {
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
    const roomId = await getDirectChatRoomId(payload);

    navigate(`/me/${roomId}`);

    onToggle();
  };

  const addFriendHandler = async (): Promise<void> => {
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
            <div className={classes["user-profile-details-nickname"]}>
              {modalData.nickname}
            </div>
            {modalData.friendSince ? (
              <div className={classes["friend-since-wrapper"]}>
                <div className={classes["friend-since-label"]}>
                  <span className={classes["friend-since-label-emoji"]}>
                    📅
                  </span>
                  친구 시작일:
                </div>
                <div className={classes["friend-since"]}>
                  {modalData.friendSince}
                </div>
              </div>
            ) : (
              <div className={classes["not-friend"]}>
                <div className={classes["not-friend-main"]}>
                  <span className={classes["not-friend-emoji"]}>👥</span> 친구가
                  아닌 사용자
                </div>
                <div className={classes["not-friend-sub"]}>
                  친구 추가 후 더 많은 정보를 확인할 수 있어요
                </div>
              </div>
            )}
            {modalData.friendSince ? (
              <div className={classes["user-profile-details-actions"]}>
                <button
                  className={`${classes["direct-chat-button"]} ${
                    modalData.friendSince ? classes.friend : ""
                  }`}
                  onClick={() =>
                    openDirectChatHandler({
                      id: modalData.userId,
                      nickname: modalData.nickname,
                      avatarColor: modalData.avatarColor,
                      avatarImageUrl: modalData.avatarImageUrl,
                    })
                  }
                >
                  <MessageCircleMore className={classes["direct-chat-icon"]} />
                  <span className={classes["direct-chat-text"]}>메시지</span>
                </button>
                <div
                  className={`${classes["friend-action-button"]} ${
                    modalData.friendSince ? "" : classes.add
                  } ${classes.tooltip}`}
                  data-tooltip="친구"
                >
                  <UserRoundCheck className={classes["friend-check-icon"]} />
                </div>
              </div>
            ) : (
              <div className={classes["user-profile-details-actions"]}>
                <div
                  className={`${classes["friend-action-button"]} ${
                    modalData.friendSince ? "" : classes.add
                  }`}
                >
                  <UserRoundPlus
                    className={classes["friend-add-icon"]}
                    onClick={addFriendHandler}
                  />{" "}
                  <span className={classes["friend-add-text"]}>
                    친구 추가하기
                  </span>
                </div>
                <button
                  className={`${classes["direct-chat-button"]} ${
                    modalData.friendSince ? classes.friend : ""
                  } ${classes.tooltip}`}
                  data-tooltip="메시지"
                  onClick={() =>
                    openDirectChatHandler({
                      id: modalData.userId,
                      nickname: modalData.nickname,
                      avatarColor: modalData.avatarColor,
                      avatarImageUrl: modalData.avatarImageUrl,
                    })
                  }
                >
                  <MessageCircleMore className={classes["direct-chat-icon"]} />
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
                  key={mutualFriendUser.id}
                  className={classes["user-profile-details-mutual-friend"]}
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
                    extraClass="user-profile-mutual-friend-avatar"
                    dotClass="user-profile-mutual-friend-online-dot"
                  />
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
                  className={classes["user-profile-details-mutual-group-chat"]}
                  onClick={() =>
                    openChatHandler({ roomId: mutualGroupChat._id })
                  }
                >
                  <div
                    className={`${
                      classes["user-profile-details-mutual-group-chat-icon"]
                    } ${
                      mutualGroupChat.title.length > 12
                        ? classes["title-small"]
                        : ""
                    }`}
                  >
                    {mutualGroupChat.title}
                  </div>
                  <div
                    className={
                      classes["user-profile-details-mutual-group-chat-title"]
                    }
                  >
                    {mutualGroupChat.title}
                  </div>
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
