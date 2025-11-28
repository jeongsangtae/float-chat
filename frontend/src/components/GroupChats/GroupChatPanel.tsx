import { useState, useEffect, useRef } from "react";

import { createPortal } from "react-dom";

import GroupChatAnnouncementForm from "./GroupChatAnnouncementForm";
import GroupChatAnnouncementDeleteConfirm from "./GroupChatAnnouncementDeleteConfirm";

import { GroupChatUserData, GroupChatPanelProps } from "../../types";

// import { FiEdit } from "react-icons/fi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { Crown, Trash2, SquarePen } from "lucide-react";

import useModalStore from "../../store/modalStore";

import Avatar from "../Users/Avatar";
import UserProfile from "../Users/UserProfile";

import classes from "./GroupChatPanel.module.css";

const GroupChatPanel = ({
  groupChatSince,
  groupChatId,
  userId,
  hostId,
  hostNickname,
  hostAvatarColor,
  hostAvatarImageUrl,
  announcement,
  groupChatUsers,
}: GroupChatPanelProps) => {
  const { activeModal, toggleModal } = useModalStore();

  const [showGroupChatUsers, setShowGroupChatUsers] = useState(false);
  const [announcementOverflow, setAnnouncementOverflow] = useState(false);
  const [showAnnouncementContent, setShowAnnouncementContent] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const announcementRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  // const active = activeUser === _id;

  // 온라인과 오프라인 분리
  const onlineUsers = groupChatUsers.filter(
    (groupChatUser) => groupChatUser.onlineChecked
  );

  const offlineUsers = groupChatUsers.filter(
    (groupChatUser) => !groupChatUser.onlineChecked
  );

  const openUserProfile = (userId: string) => {
    setActiveUser((prev) => (prev === userId ? null : userId));
  };

  const userProfileHandler = () => {
    if (!userRef.current) return;

    const rect = userRef.current.getBoundingClientRect();

    setCoords({
      top: rect.top,
      left: rect.left + 10,
    });

    console.log("클릭 확인");
    console.log(activeUser);

    openUserProfile(activeUser);
  };

  // 사용자 배열에서 호스트를 최상단으로 정렬하는 내용
  const prioritizeHost = (users: GroupChatUserData[]) => {
    return users.sort((a, b) => {
      if (a.nickname === hostNickname) return -1; // a가 호스트면 앞으로
      if (b.nickname === hostNickname) return 1; // b가 호스트면 앞으로
      return 0; // 둘 다 호스트가 아니라면 순서 유지
    });
  };

  // 온라인 사용자 목록 (호스트가 있다면 최상단으로 정렬)
  const sortedOnlineUsers = prioritizeHost([...onlineUsers]);

  // 오프라인 사용자 목록 (호스트가 있다면 최상단으로 정렬)
  const sortedOfflineUsers = prioritizeHost([...offlineUsers]);

  // 온라인 우선으로 정렬된 전체 사용자 목록
  // 각 그룹 내에서는 호스트가 최상단에 위치
  const allUsers = [...sortedOnlineUsers, ...sortedOfflineUsers];

  // 온라인 사용자 우선, 부족하면 오프라인으로 채워서 최대 3명까지만 미리보기
  const previewUsers = allUsers.slice(0, 3);

  // 현재 화면에 보여줄 사용자 목록
  const displayedUsers = showGroupChatUsers ? allUsers : previewUsers;

  useEffect(() => {
    setShowGroupChatUsers(false);
  }, [groupChatId]);

  useEffect(() => {
    if (announcementRef.current) {
      const announcementDiv = announcementRef.current;
      setAnnouncementOverflow(
        announcementDiv.scrollHeight > announcementDiv.clientHeight
      );
    }
  }, [announcement]);

  useEffect(() => {
    setImageError(false);
  }, [hostAvatarImageUrl]);

  const toggleGroupChatUsersHandler = () => {
    setShowGroupChatUsers(!showGroupChatUsers);
  };

  const toggleAnnouncementContentHandler = () => {
    setShowAnnouncementContent(!showAnnouncementContent);
  };

  const groupChatAnnouncementEditHandler = () => {
    toggleModal("groupChatAnnouncementForm", "PATCH", {
      groupChatId,
      announcement,
    });
  };

  const groupChatAnnouncementDeleteHandler = () => {
    toggleModal("groupChatAnnouncementDelete", "PATCH", {
      groupChatId,
    });
  };

  return (
    <div className={classes["group-chat-panel"]}>
      {hostAvatarImageUrl && !imageError ? (
        <img
          className={classes["avatar-header-img"]}
          onError={() => setImageError(true)}
          src={hostAvatarImageUrl}
        />
      ) : (
        <div
          className={classes["avatar-header-color"]}
          style={{ backgroundColor: hostAvatarColor || "#ccc" }}
        ></div>
      )}

      <div className={classes["group-chat-host-info"]}>
        <Avatar
          nickname={hostNickname}
          avatarImageUrl={hostAvatarImageUrl}
          avatarColor={hostAvatarColor}
          extraClass="group-chat-host-info-avatar"
        />

        <h3 className={classes.nickname}>{hostNickname}</h3>

        <div className={classes["group-chat-announcement-wrapper"]}>
          <div className={classes["group-chat-announcement-header"]}>
            <span>📌 공지사항</span>
            {userId === hostId && (
              <div className={classes["group-chat-announcement-icon-wrapper"]}>
                {announcement && (
                  <Trash2
                    className={classes["group-chat-announcement-delete-icon"]}
                    onClick={groupChatAnnouncementDeleteHandler}
                  />
                )}
                <SquarePen
                  className={classes["group-chat-announcement-edit-icon"]}
                  onClick={groupChatAnnouncementEditHandler}
                />
                {/* <FiEdit onClick={groupChatAnnouncementEditHandler} /> */}
              </div>
            )}
          </div>
          <div
            className={`${classes["group-chat-announcement-content"]} ${
              !showAnnouncementContent
                ? ""
                : classes["announcement-full-content"]
            }`}
            ref={announcementRef}
          >
            {announcement || "등록된 공지가 없습니다."}
          </div>

          {announcementOverflow && (
            <div className={classes["group-chat-announcement-button-wrapper"]}>
              <button
                className={classes["group-chat-announcement-button"]}
                onClick={toggleAnnouncementContentHandler}
              >
                {!showAnnouncementContent ? (
                  <IoIosArrowDown />
                ) : (
                  <IoIosArrowUp />
                )}
              </button>
            </div>
          )}
        </div>

        {activeModal === "groupChatAnnouncementForm" && (
          <GroupChatAnnouncementForm
            onToggle={() => toggleModal("groupChatAnnouncementForm")}
          />
        )}

        {activeModal === "groupChatAnnouncementDelete" && (
          <GroupChatAnnouncementDeleteConfirm
            onToggle={() => toggleModal("groupChatAnnouncementDelete")}
          />
        )}

        <div className={classes["group-chat-users-wrapper"]}>
          <div className={classes["group-chat-users-header"]}>
            👥 총 {groupChatUsers.length}명 참여
          </div>
          {displayedUsers.map((displayedUser) => (
            <div
              key={`groupChatUser-${displayedUser._id}`}
              className={classes["group-chat-user"]}
              onClick={userProfileHandler}
              ref={userRef}
            >
              <Avatar
                nickname={displayedUser.nickname}
                avatarImageUrl={displayedUser.avatarImageUrl}
                avatarColor={displayedUser.avatarColor}
                onlineChecked={displayedUser.onlineChecked}
                showOnlineDot={true}
                extraClass={displayedUser.onlineChecked ? "" : "offline"}
              />

              <div
                className={`${classes["group-chat-user-nickname-wrapper"]} ${
                  displayedUser.onlineChecked ? "" : classes.offline
                }`}
              >
                <span className={classes["group-chat-user-nickname"]}>
                  {displayedUser.nickname}
                </span>
                {hostNickname === displayedUser.nickname && (
                  <Crown className={classes["group-chat-host-user-icon"]} />
                )}
              </div>

              {activeUser === displayedUser._id &&
                createPortal(
                  <UserProfile
                    userId={displayedUser._id}
                    nickname={displayedUser.nickname}
                    avatarImageUrl={displayedUser.avatarImageUrl}
                    avatarColor={displayedUser.avatarColor}
                    onlineChecked={displayedUser.onlineChecked}
                    style={{
                      position: "fixed",
                      top: coords.top,
                      left: coords.left,
                    }}
                  />,
                  document.getElementById("user-profile-tooltip-portal")!
                )}
            </div>
          ))}

          {groupChatUsers.length > 3 && (
            <div className={classes["group-chat-users-button-wrapper"]}>
              <button
                className={classes["group-chat-users-button"]}
                onClick={toggleGroupChatUsersHandler}
              >
                {!showGroupChatUsers ? <IoIosArrowDown /> : <IoIosArrowUp />}
              </button>
            </div>
          )}
        </div>

        <div className={classes["group-chat-since-wrapper"]}>
          <div className={classes["group-chat-since-label"]}>
            <span className={classes["group-chat-since-label-emoji"]}>📅</span>
            그룹 채팅방 생성일:
          </div>
          <div className={classes["group-chat-since"]}>{groupChatSince}</div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPanel;
