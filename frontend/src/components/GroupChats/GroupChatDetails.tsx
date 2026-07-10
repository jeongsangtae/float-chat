import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";

import { IoIosSearch } from "react-icons/io";
import { IoClose, IoPersonAddSharp } from "react-icons/io5";

import { Coords } from "../../types";

import UserProfile from "../Users/UserProfile";
import UserProfileDetails from "../Users/UserProfileDetails";

import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useFriendStore from "../../store/friendStore";
import useLayoutStore from "../../store/layoutStore";
import useModalStore from "../../store/modalStore";

import Modal from "../UI/Modal";
import Chats from "../Chats/Chats";
import ChatInput from "../Chats/ChatInput";
import GroupChatInvite from "./GroupChatInvite";
import GroupChatUsers from "./GroupChatUsers";
import GroupChatPanel from "./GroupChatPanel";

import {
  UserProfileEditFormPayload,
  UserProfileDetailsPayload,
} from "../../types";

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

  // 현재 선택된 사용자 프로필 정보
  const activeUserProfile = groupChatUsers.find(
    (groupChatUser) => groupChatUser._id === activeUser
  );

  // 사용자 프로필 툴팁 열기/닫기
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

  // 그룹 채팅방 초대 모달 열기 또는 닫기
  const toggleInviteHandler = (): void => {
    setSearchTerm("");
    setToggle(!toggle);
    loadFriends();
  };

  const userId = userInfo?._id;

  // 친구 객체에서 상대 사용자 정보만 추출
  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  // 검색어에 맞는 친구 목록 필터링
  const searchFriends = filteredFriends.filter(
    (friendData) =>
      friendData.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendData.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 현재 그룹 채팅방 정보
  const groupChat = groupChats.find((groupChat) => groupChat._id === roomId);

  // 그룹 채팅방 생성일 조회
  const groupChatSince = useMemo(() => {
    const groupChatDateStr = groupChat?.date;
    if (!groupChatDateStr) return null;

    const [groupChatSinceDate] = groupChatDateStr.split(" ");
    const [year, month, day] = groupChatSinceDate.split(".");

    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }, [groupChat?.date]);

  // 현재 레이아웃 및 그룹 채팅방 제목 설정
  useEffect(() => {
    setView("groupChat");
    setGroupChatTitle(groupChat?.title ?? "");
  }, [groupChat?.title]);

  // 그룹 채팅방 목록 조회
  useEffect(() => {
    getGroupChats();
  }, []);

  // 그룹 채팅방 변경 시 참여자 목록 조회 및 선택 상태 초기화
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

  // 사용자 프로필 외부 클릭 시 프로필 닫기
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

      setActiveUser(null);
      setCoords(null);
      setOrigin(null);
    };

    document.addEventListener("mousedown", outsideClickHandler);

    return () => {
      document.removeEventListener("mousedown", outsideClickHandler);
    };
  }, [activeUser]);

  // 프로필 수정 모달 열기
  const openUserProfileEditFormHandler = (
    payload: UserProfileEditFormPayload
  ) => {
    setCoords(null);

    toggleModal("userSettings", "PATCH", payload);
  };

  // 프로필 상세 모달 열기
  const openUserProfileDetailsHandler = (
    payload: UserProfileDetailsPayload
  ) => {
    setCoords(null);

    toggleModal("userProfileDetails", undefined, payload);
  };

  return (
    <div className={classes["group-chat-details"]}>
      <div className={classes["group-chat-sidebar"]}>
        <div
          className={classes["group-chat-invite-button"]}
          onClick={toggleInviteHandler}
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

      {/* 그룹 채팅방 초대 모달 */}
      {toggle && (
        <Modal onToggle={toggleInviteHandler}>
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
                  onToggle={toggleInviteHandler}
                />
              ))}
            </ul>
          </div>
        </Modal>
      )}

      <div className={classes["group-chat-area"]}>
        <Chats
          roomId={roomId}
          chatInfo={{
            type: "group",
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

      {/* 사용자 프로필 툴팁 Portal */}
      {activeUserProfile &&
        coords &&
        createPortal(
          <UserProfile
            userId={activeUserProfile._id}
            nickname={activeUserProfile.nickname}
            avatarImageUrl={activeUserProfile.avatarImageUrl}
            avatarColor={activeUserProfile.avatarColor}
            onlineChecked={activeUserProfile.onlineChecked}
            onOpenUserProfileEditForm={openUserProfileEditFormHandler}
            onOpenUserProfileDetails={openUserProfileDetailsHandler}
            origin={origin}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: coords.transform,
            }}
            // onOverflow={(overflow) => {
            //   setCoords((prev) =>
            //     prev
            //       ? {
            //           ...prev,
            //           top: prev.top - overflow - 10,
            //         }
            //       : prev
            //   );
            // }}
          />,
          document.getElementById("user-profile-tooltip-portal")!
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
