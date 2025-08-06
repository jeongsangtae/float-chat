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
          className={classes.avatar}
          style={{ backgroundColor: chatInfo.avatarColor }}
        >
          {chatInfo.nickname?.charAt(0)}
          <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
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
          <div className={classes["share-content-wrapper"]}>
            {mutualGroupChats.length > 0 && (
              <div className={classes["group-chat-share"]}>
                같이 있는 그룹 채팅방 - {mutualGroupChats.length}
              </div>
            )}

            {mutualGroupChats.map((mutualGroupChat) => (
              <Link to={`${mutualGroupChat._id}`}>
                <div>
                  <div>그룹 채팅방</div>
                </div>
              </Link>
            ))}

            {mutualGroupChats.length > 0 && mutualFriendUsers.length > 0 && (
              <div className={classes.underline}></div>
            )}

            {mutualFriendUsers.length > 0 && (
              <div className={classes["group-chat-share-friend"]}>
                같이 아는 친구 - {mutualFriendUsers.length}
              </div>
            )}

            {mutualFriendUsers.map((mutualFriendUser) => (
              <Link to={`${mutualFriendUser.id}`}>
                <div>
                  <div>친구</div>
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
