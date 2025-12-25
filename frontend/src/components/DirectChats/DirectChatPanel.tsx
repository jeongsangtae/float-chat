import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { DirectChatPanelProps } from "../../types";

import { IoIosArrowForward, IoIosArrowDown } from "react-icons/io";

import useDirectChatStore from "../../store/directChatStore";

import Avatar from "../Users/Avatar";

import classes from "./DirectChatPanel.module.css";

const DirectChatPanel = ({
  chatInfo,
  onlineChecked,
  friendSince,
  mutualGroupChats,
  mutualFriendUsers,
}: DirectChatPanelProps) => {
  const navigate = useNavigate();

  const { directChatForm } = useDirectChatStore();

  const [showMutualGroupChats, setShowMutualGroupChats] = useState(false);
  const [showMutualFriends, setShowMutualFriends] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setShowMutualGroupChats(false);
    setShowMutualFriends(false);
  }, [chatInfo.userId]);

  useEffect(() => {
    setImageError(false);
  }, [chatInfo.avatarImageUrl]);

  const toggleMutualGroupChatsHandler = () => {
    setShowMutualGroupChats(!showMutualGroupChats);
  };

  const toggleMutualFriendsHandler = () => {
    setShowMutualFriends(!showMutualFriends);
  };

  // console.log(mutualFriendUsers);

  const openDirectChatHandler = async (
    id,
    nickname,
    avatarColor,
    avatarImageUrl
  ): Promise<void> => {
    if (!id) {
      console.error("id가 정의되지 않았습니다.");
      return;
    }

    const roomId = await directChatForm(
      id,
      nickname,
      avatarColor,
      avatarImageUrl
    );

    navigate(`/me/${roomId}`);
  };

  return (
    <div className={classes["direct-chat-panel"]}>
      {chatInfo.avatarImageUrl && !imageError ? (
        <img
          className={classes["avatar-header"]}
          onError={() => setImageError(true)}
          src={chatInfo.avatarImageUrl}
        />
      ) : (
        <div
          className={classes["avatar-header"]}
          style={{ backgroundColor: chatInfo.avatarColor || "#ccc" }}
        ></div>
      )}

      <div className={classes["direct-chat-other-info"]}>
        {chatInfo.avatarImageUrl && !imageError ? (
          <div className={classes["direct-chat-other-info-avatar-img-wrapper"]}>
            <img
              className={classes["direct-chat-other-info-avatar-img"]}
              onError={() => setImageError(true)}
              src={chatInfo.avatarImageUrl}
            />
            <div
              className={
                onlineChecked
                  ? classes["direct-chat-other-info-online-dot"]
                  : classes["direct-chat-other-info-offline-dot"]
              }
            />
          </div>
        ) : (
          <div
            className={classes["direct-chat-other-info-avatar-color"]}
            style={{ backgroundColor: chatInfo.avatarColor || "#ccc" }}
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
        )}

        <h3 className={classes.nickname}>{chatInfo.nickname}</h3>

        {friendSince ? (
          <div className={classes["friend-since-wrapper"]}>
            <div className={classes["friend-since-label"]}>
              <span className={classes["friend-since-label-emoji"]}>📅</span>
              친구 시작일:
            </div>
            <div className={classes["friend-since"]}>{friendSince}</div>
          </div>
        ) : (
          <div className={classes["not-friend"]}>친구가 아닌 사용자</div>
        )}

        {(mutualGroupChats.length || mutualFriendUsers.length) > 0 && (
          <div className={classes["mutual-content-wrapper"]}>
            {mutualGroupChats.length > 0 && (
              <div
                className={classes["mutual-group-chat-count"]}
                onClick={toggleMutualGroupChatsHandler}
              >
                <div className={classes["mutual-group-chat-text-wrapper"]}>
                  <span className={classes["mutual-group-chat-text"]}>
                    같이 있는 그룹 채팅방
                  </span>
                  <span className={classes.line}>ㅡ</span>
                  <span>{mutualGroupChats.length}</span>
                </div>

                <div className={classes["mutual-group-chat-icon-wrapper"]}>
                  {!showMutualGroupChats ? (
                    <IoIosArrowForward />
                  ) : (
                    <IoIosArrowDown />
                  )}
                </div>
              </div>
            )}

            {showMutualGroupChats && (
              <>
                {mutualGroupChats.map((mutualGroupChat) => (
                  <Link
                    key={`mutualGroupChat-${mutualGroupChat._id}`}
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
              </>
            )}

            {mutualGroupChats.length > 0 && mutualFriendUsers.length > 0 && (
              <div className={classes.underline}></div>
            )}

            {mutualFriendUsers.length > 0 && (
              <div
                className={classes["mutual-friend-user-count"]}
                onClick={toggleMutualFriendsHandler}
              >
                <div className={classes["mutual-friend-user-text-wrapper"]}>
                  <span className={classes["mutual-friend-user-text"]}>
                    같이 아는 친구
                  </span>
                  <span className={classes.line}>ㅡ</span>
                  <span>{mutualFriendUsers.length}</span>
                </div>

                <div className={classes["mutual-friend-user-icon-wrapper"]}>
                  {!showMutualFriends ? (
                    <IoIosArrowForward />
                  ) : (
                    <IoIosArrowDown />
                  )}
                </div>
              </div>
            )}

            {showMutualFriends && (
              <>
                {mutualFriendUsers.map((mutualFriendUser) => (
                  // <Link
                  //   key={`mutualFriend-${
                  //     mutualFriendUser.id || mutualFriendUser.roomId
                  //   }`}
                  //   to={`/me/${mutualFriendUser.roomId}`}
                  //   className={classes["mutual-friend-user"]}
                  // >
                  //   <Avatar
                  //     nickname={mutualFriendUser.nickname}
                  //     avatarImageUrl={mutualFriendUser.avatarImageUrl}
                  //     avatarColor={mutualFriendUser.avatarColor}
                  //     onlineChecked={mutualFriendUser.onlineChecked}
                  //     showOnlineDot={true}
                  //     extraClass="mutual-friend-user-avatar"
                  //     dotClass="mutual-friend-user-online-check-dot"
                  //   />

                  //   <div className={classes["mutual-friend-user-nickname"]}>
                  //     {mutualFriendUser.nickname}
                  //   </div>
                  // </Link>
                  <div
                    key={`mutualFriend-${
                      mutualFriendUser.id || mutualFriendUser.roomId
                    }`}
                    onClick={() =>
                      openDirectChatHandler(
                        mutualFriendUser.id,
                        mutualFriendUser.nickname,
                        mutualFriendUser.avatarColor,
                        mutualFriendUser.avatarImageUrl
                      )
                    }
                    className={classes["mutual-friend-user"]}
                  >
                    <Avatar
                      nickname={mutualFriendUser.nickname}
                      avatarImageUrl={mutualFriendUser.avatarImageUrl}
                      avatarColor={mutualFriendUser.avatarColor}
                      onlineChecked={mutualFriendUser.onlineChecked}
                      showOnlineDot={true}
                      extraClass="mutual-friend-user-avatar"
                      dotClass="mutual-friend-user-online-check-dot"
                    />

                    <div className={classes["mutual-friend-user-nickname"]}>
                      {mutualFriendUser.nickname}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectChatPanel;
