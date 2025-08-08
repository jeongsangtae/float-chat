import { Link } from "react-router-dom";
import { DirectChatPanelProps } from "../../types";

import classes from "./DirectChatPanel.module.css";

const DirectChatPanel = ({
  chatInfo,
  onlineChecked,
  friendSince,
  mutualGroupChats,
  mutualFriendUsers,
}: DirectChatPanelProps) => {
  return (
    <div className={classes["direct-chat-panel"]}>
      <div
        className={classes["avatar-header"]}
        style={{ backgroundColor: chatInfo.avatarColor }}
      ></div>

      <div className={classes["direct-chat-other-info"]}>
        <div
          className={classes["direct-chat-other-info-avatar"]}
          style={{ backgroundColor: chatInfo.avatarColor }}
        >
          {chatInfo.nickname?.charAt(0)}
          <div
            className={
              onlineChecked
                ? classes["direct-chat-other-info-online-dot"]
                : classes["direct-chat-other-info-offline-dot"]
            }
          />
        </div>
        <h3 className={classes.nickname}>{chatInfo.nickname}</h3>

        {friendSince ? (
          <div className={classes["friend-since-wrapper"]}>
            <div className={classes["friend-since-label"]}>친구 시작일:</div>
            <div className={classes["friend-since"]}>{friendSince}</div>
          </div>
        ) : (
          <div className={classes["not-friend"]}>친구가 아닌 사용자</div>
        )}

        {(mutualGroupChats.length || mutualFriendUsers.length) > 0 && (
          <div className={classes["mutual-content-wrapper"]}>
            {mutualGroupChats.length > 0 && (
              <div className={classes["mutual-group-chat-count"]}>
                같이 있는 그룹 채팅방 - {mutualGroupChats.length}
              </div>
            )}

            {mutualGroupChats.map((mutualGroupChat) => (
              <Link
                to={`/group-chat/${mutualGroupChat._id}`}
                className={classes["mutual-group-chat"]}
              >
                <div
                  className={`${classes["mutual-group-chat-icon"]} ${
                    mutualGroupChat.title.length > 12
                      ? classes["mutual-group-chat-icon-small"]
                      : ""
                  }`}
                >
                  {mutualGroupChat.title}
                </div>
                <div className={classes["mutual-group-chat-title"]}>
                  {mutualGroupChat.title}
                </div>
              </Link>
            ))}

            {mutualGroupChats.length > 0 && mutualFriendUsers.length > 0 && (
              <div className={classes.underline}></div>
            )}

            {mutualFriendUsers.length > 0 && (
              <div className={classes["mutual-friend-user-count"]}>
                같이 아는 친구 - {mutualFriendUsers.length}
              </div>
            )}

            {mutualFriendUsers.map((mutualFriendUser) => (
              <Link
                to={`/me/${mutualFriendUser.id}`}
                className={classes["mutual-friend-user"]}
              >
                <div>
                  <div
                    className={classes["mutual-friend-user-avatar"]}
                    style={{ backgroundColor: mutualFriendUser.avatarColor }}
                  >
                    {mutualFriendUser.nickname.charAt(0)}
                    <div
                      className={
                        onlineChecked
                          ? classes["mutual-friend-user-online-dot"]
                          : classes["mutual-friend-user-offline-dot"]
                      }
                    />
                  </div>
                </div>
                <div className={classes["mutual-friend-user-nickname"]}>
                  {mutualFriendUser.nickname}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChatPanel;
