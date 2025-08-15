import { useState } from "react";

import GroupChatAnnouncementForm from "./GroupChatAnnouncementForm";

import { GroupChatPanelProps } from "../../types";

import { FiEdit } from "react-icons/fi";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import classes from "./GroupChatPanel.module.css";
import useModalStore from "../../store/modalStore";

const GroupChatPanel = ({
  groupChatSince,
  groupChatId,
  userId,
  hostId,
  hostNickname,
  hostAvatarColor,
  announcement,
  groupChatUsers,
}: GroupChatPanelProps) => {
  const { activeModal, toggleModal } = useModalStore();

  const [showGroupChatUsers, setShowGroupChatUsers] = useState(false);

  // 온라인과 오프라인 분리
  const onlineUsers = groupChatUsers.filter(
    (groupChatUser) => groupChatUser.onlineChecked
  );

  const offlineUsers = groupChatUsers.filter(
    (groupChatUser) => !groupChatUser.onlineChecked
  );

  // 온라인 우선으롤 정렬된 전체 사용자 목록
  const allUsers = [...onlineUsers, ...offlineUsers];

  // 온라인 사용자 우선, 부족하면 오프라인으로 채워서 최대 3명까지만 미리보기
  const previewUsers = [...onlineUsers, ...offlineUsers].slice(0, 3);

  // 현재 화면에 보여줄 사용자 목록
  const displayedUsers = showGroupChatUsers ? allUsers : previewUsers;

  const toggleGroupChatUsersHandler = () => {
    setShowGroupChatUsers(!showGroupChatUsers);
  };

  const groupChatAnnouncementEditHandler = () => {
    toggleModal("groupChatAnnouncementForm", "PATCH", {
      groupChatId,
      announcement,
    });
  };

  return (
    <div className={classes["group-chat-panel"]}>
      <div
        className={classes["avatar-header"]}
        style={{ backgroundColor: hostAvatarColor }}
      ></div>

      <div className={classes["group-chat-host-info"]}>
        <div
          className={classes.avatar}
          style={{ backgroundColor: hostAvatarColor }}
        >
          {hostNickname?.charAt(0)}
          {/* <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          /> */}
        </div>
        <h3 className={classes.nickname}>{hostNickname}</h3>

        <div>
          <div>공지 출력하는 공간</div>
          {userId === hostId && (
            <FiEdit onClick={groupChatAnnouncementEditHandler} />
          )}
        </div>

        {activeModal === "groupChatAnnouncementForm" && (
          <GroupChatAnnouncementForm
            onToggle={() => toggleModal("groupChatAnnouncementForm")}
          />
        )}

        <div className={classes["group-chat-users-wrapper"]}>
          <div>총 {groupChatUsers.length}명 참여</div>
          {displayedUsers.map((displayedUser) => (
            <div
              key={`groupChatUser-${displayedUser._id}`}
              className={classes["group-chat-user"]}
            >
              <div
                className={classes["group-chat-user-avatar"]}
                style={{
                  backgroundColor: displayedUser.avatarColor,
                }}
              >
                {displayedUser.nickname.charAt(0)}
                <div
                  className={
                    displayedUser.onlineChecked
                      ? classes["online-dot"]
                      : classes["offline-dot"]
                  }
                />
              </div>
              <div className={classes["group-chat-user-nickname"]}>
                {displayedUser.nickname}
              </div>
            </div>
          ))}

          {groupChatUsers.length > 3 && (
            <button onClick={toggleGroupChatUsersHandler}>
              {!showGroupChatUsers ? <IoIosArrowDown /> : <IoIosArrowUp />}
            </button>
          )}
        </div>

        <div className={classes["group-chat-since-wrapper"]}>
          <div className={classes["group-chat-since-label"]}>
            그룹 채팅방 생성일:
          </div>
          <div className={classes["group-chat-since"]}>{groupChatSince}</div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatPanel;
