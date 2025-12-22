import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";

import { IoIosSearch } from "react-icons/io";
import { IoClose, IoPersonAddSharp } from "react-icons/io5";

import { Coords } from "../../types";

import EditUserProfileForm from "../Users/EditUserProfileForm";
import UserProfileDetails from "../Users/UserProfileDetails";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useFriendStore from "../../store/friendStore";
import useLayoutStore from "../../store/layoutStore";
import useModalStore from "../../store/modalStore";

import Modal from "../UI/Modal";
import Chats from "../Chats/Chats";
import ChatInput from "../Chats/ChatInput";
import UserProfile from "../Users/UserProfile";
import GroupChatInvite from "./GroupChatInvite";
import GroupChatUsers from "./GroupChatUsers";
import GroupChatPanel from "./GroupChatPanel";

import classes from "./GroupChatDetails.module.css";

const GroupChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { userInfo } = useAuthStore();
  const { groupChats, getGroupChats, groupChatUsers, getGroupChatUsers } =
    useGroupChatStore();
  const { friends, loadFriends } = useFriendStore();
  const { setView, setGroupChatTitle } = useLayoutStore();
  const { activeModal, toggleModal } = useModalStore();

  const [toggle, setToggle] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [origin, setOrigin] = useState<"users" | "panel" | null>(null);

  const activeUserProfile = groupChatUsers.find(
    (groupChatUser) => groupChatUser._id === activeUser
  );

  const openUserProfileHandler = (
    userId: string,
    coords: Coords,
    source: "users" | "panel"
  ) => {
    if (activeUser === userId && origin === source) {
      setActiveUser(null);
      setCoords(null);
      return;
    }

    setActiveUser(userId);
    setCoords(coords);
    setOrigin(source);
  };

  // 이름 변경 필요
  const toggleHandler = (): void => {
    setToggle(!toggle);
    loadFriends();
  };

  const userId = userInfo?._id;

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  const searchFriends = filteredFriends.filter(
    (friendData) =>
      friendData.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendData.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupChat = groupChats.find((groupChat) => groupChat._id === roomId);

  const groupChatSince = useMemo(() => {
    const groupChatDateStr = groupChat?.date;
    if (!groupChatDateStr) return null;

    const [groupChatSinceDate] = groupChatDateStr.split(" ");
    const [year, month, day] = groupChatSinceDate.split(".");

    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }, [groupChat?.date]);

  useEffect(() => {
    setView("groupChat");
    setGroupChatTitle(groupChat?.title ?? "");
  }, [groupChat?.title]);

  useEffect(() => {
    getGroupChats();
  }, []);

  useEffect(() => {
    if (!roomId) {
      console.error("roomId가 정의되지 않았습니다.");
      return;
    }

    setActiveUser(null);
    setCoords(null);
    setOrigin(null);

    getGroupChatUsers(roomId);
  }, [roomId]);

  useEffect(() => {
    const outsideClickHandler = (event: MouseEvent) => {
      const userProfileEl = document.getElementById(
        "user-profile-tooltip-portal"
      );

      if (!userProfileEl) return;

      const target = event.target as HTMLElement;

      // 포털 내부 무시
      if (userProfileEl.contains(target)) return;

      // 사용자 버튼 내부 무시
      if (target.closest(".user-profile-trigger")) return;

      // 사용자 프로필 외부 클릭이면 닫기
      setActiveUser(null);
      setCoords(null);
      setOrigin(null);
    };

    document.addEventListener("mousedown", outsideClickHandler);

    return () => {
      document.removeEventListener("mousedown", outsideClickHandler);
    };
  }, [activeUser]);

  const openUserProfileDetailsHandler = (payload) => {
    setCoords(null);
    // setActiveUser(null)

    toggleModal("userProfileDetails", undefined, {
      ...payload,
      initialView: payload.view,
    });
  };

  return (
    <div className={classes["group-chat-details"]}>
      <div className={classes["group-chat-sidebar"]}>
        <div
          className={classes["group-chat-invite-button"]}
          onClick={toggleHandler}
        >
          <div className={classes["group-chat-invite-icon"]}>
            <IoPersonAddSharp />
          </div>
          <span className={classes["group-chat-invite-text"]}>초대</span>
        </div>

        <div className={classes.underline}></div>

        <GroupChatUsers
          groupChatUsers={groupChatUsers}
          onOpenUserProfile={openUserProfileHandler}
        />
      </div>

      {toggle && (
        <Modal onToggle={toggleHandler}>
          <div className={classes["group-chat-invite-modal-content"]}>
            <div className={classes["group-chat-invite-title"]}>
              친구를 {groupChat?.title} 그룹 채팅방으로 초대하기
            </div>

            <div className={classes["group-chat-invite-search"]}>
              <input
                type="text"
                className={classes["group-chat-invite-search-input"]}
                placeholder="친구 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <IoClose
                  className={classes["group-chat-invite-search-delete-icon"]}
                  onClick={() => setSearchTerm("")}
                />
              ) : (
                <IoIosSearch
                  className={classes["group-chat-invite-search-icon"]}
                />
              )}
            </div>

            <ul className={classes["group-chat-invite"]}>
              {searchFriends.map((friend) => (
                <GroupChatInvite
                  key={friend.id}
                  roomId={roomId ?? ""}
                  friendId={friend.id}
                  nickname={friend.nickname}
                  avatarColor={friend.avatarColor}
                  avatarImageUrl={friend.avatarImageUrl}
                  onToggle={toggleHandler}
                />
              ))}
            </ul>
          </div>
        </Modal>
      )}

      <div className={classes["group-chat-area"]}>
        <Chats
          roomId={roomId}
          type="group"
          chatInfo={{
            title: groupChat?.title,
          }}
        />
        <ChatInput roomId={roomId} />
      </div>

      <GroupChatPanel
        groupChatSince={groupChatSince ?? ""}
        groupChatId={groupChat?._id ?? ""}
        userId={userInfo?._id ?? ""}
        hostId={groupChat?.hostId ?? ""}
        hostNickname={groupChat?.hostNickname ?? ""}
        hostAvatarColor={groupChat?.hostAvatarColor ?? ""}
        hostAvatarImageUrl={groupChat?.hostAvatarImageUrl ?? ""}
        announcement={groupChat?.announcement ?? ""}
        groupChatUsers={groupChatUsers}
        onOpenUserProfile={openUserProfileHandler}
      />

      {activeUserProfile &&
        coords &&
        createPortal(
          <UserProfile
            userId={activeUserProfile._id}
            nickname={activeUserProfile.nickname}
            avatarImageUrl={activeUserProfile.avatarImageUrl}
            avatarColor={activeUserProfile.avatarColor}
            onlineChecked={activeUserProfile.onlineChecked}
            onOpenUserProfileDetails={openUserProfileDetailsHandler}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
          />,
          document.getElementById("user-profile-tooltip-portal")!
        )}

      {activeModal === "editUserProfileForm" && (
        <EditUserProfileForm
          onToggle={() => toggleModal("editUserProfileForm")}
        />
      )}

      {activeModal === "userProfileDetails" && (
        <UserProfileDetails
          onToggle={() => toggleModal("userProfileDetails")}
        />
      )}
    </div>
  );
};

export default GroupChatDetails;
