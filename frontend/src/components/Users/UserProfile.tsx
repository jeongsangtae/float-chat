import { useEffect, useMemo } from "react";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";

import UserProfileChatInput from "../Chats/UserProfileChatInput";

import { UserProfileProps } from "../../types";

import classes from "./UserProfile.module.css";
import useDirectChatStore from "../../store/directChatStore";

const UserProfile = ({
  userId,
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  onOpenUserProfileEditForm,
  onOpenUserProfileDetails,
  origin,
  style,
}: UserProfileProps) => {
  // 그룹 채팅방 내의 사용자를 클릭하면 보여지는 내용

  // 아바타 (온라인 유무 포함), 친구 관계 여부, 닉네임, 같이 아는 친구 수, 같이 참여한 채팅방 수, 다이렉트 채팅 메시지를 보내는 입력창으로 구성될 예정

  const { userInfo } = useAuthStore();
  const {
    friends,
    loadFriends,
    otherUserFriends,
    loadOtherUserFriends,
    onlineFriends,
  } = useFriendStore();
  const { directChats, getDirectChat } = useDirectChatStore();
  const { groupChats } = useGroupChatStore();

  useEffect(() => {
    loadFriends();

    if (userId) {
      loadOtherUserFriends(userId);
    }

    getDirectChat();
  }, [userId]);

  const friendSince = useMemo(() => {
    const friendSinceDateStr = friends.find((friend) => {
      return (
        (friend.requester.id === userInfo?._id &&
          friend.receiver.id === userId) ||
        (friend.requester.id === userId && friend.receiver.id === userInfo?._id)
      );
    })?.date;

    if (!friendSinceDateStr) return null;

    const [friendSinceDate] = friendSinceDateStr.split(" ");
    const [year, month, day] = friendSinceDate.split(".");

    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }, [friends, userInfo?._id, userId]);

  const mutualFriends = useMemo(() => {
    return friends.filter((friend) => {
      const userFriendId =
        friend.requester.id === userInfo?._id
          ? friend.receiver.id
          : friend.requester.id;

      if (userFriendId === userId) return false;

      return otherUserFriends.some((otherUserFriend) => {
        const otherUserFriendId =
          otherUserFriend.requester.id === userId
            ? otherUserFriend.receiver.id
            : otherUserFriend.requester.id;

        return (
          otherUserFriendId === userFriendId &&
          otherUserFriendId !== userInfo?._id
        );
      });
    });
  }, [friends, otherUserFriends, userInfo?._id, userId]);

  const mutualFriendUsers = useMemo(() => {
    return mutualFriends.map((mutualFriend) => {
      // mutualFriend에서 "나"가 아닌 함께 아는 친구 정보 추출
      const mutualFriendInfo =
        mutualFriend.requester.id === userInfo?._id
          ? mutualFriend.receiver
          : mutualFriend.requester;

      const mutualFriendOnlineChecked = onlineFriends.some((onlineFriend) => {
        const targetId =
          onlineFriend.requester.id === userInfo?._id
            ? onlineFriend.receiver.id
            : onlineFriend.requester.id;
        return targetId === mutualFriendInfo.id;
      });

      // "나"와 함께 아는 친구 사이의 1:1 다이렉트 채팅방 찾기
      const directChat = directChats.find((directChat) => {
        const hasUserInfo = directChat.participants.some((participant) => {
          return participant._id === userInfo?._id;
        });

        const hasFriend = directChat.participants.some((participant) => {
          return participant._id === mutualFriendInfo.id;
        });

        return hasUserInfo && hasFriend;
      });

      return {
        ...mutualFriendInfo,
        roomId: directChat?._id ?? "",
        onlineChecked: mutualFriendOnlineChecked,
      };
    });
  }, [mutualFriends, directChats, onlineFriends, userInfo?._id]);

  const mutualGroupChats = groupChats.filter((groupChat) => {
    if (!userInfo || !userId) return false;

    const users = groupChat.users ?? [];

    return users.includes(userInfo._id) && users.includes(userId);
  });

  const userProfileEditHandler = (): void => {
    if (!userInfo?._id || !userInfo.nickname) return;

    onOpenUserProfileEditForm({
      _id: userInfo?._id,
      nickname: userInfo?.nickname,
      avatarColor: userInfo?.avatarColor,
      avatarImageUrl: userInfo?.avatarImageUrl,
    });
  };

  const userProfileDetailsHandler = (view: "friends" | "groups"): void => {
    onOpenUserProfileDetails({
      userId,
      nickname,
      avatarImageUrl,
      avatarColor,
      onlineChecked,
      friendSince,
      mutualFriendUsers,
      mutualGroupChats,
      initialView: view,
    });
  };

  return (
    <div
      className={`${classes["user-profile-wrapper"]} user-profile-container ${
        userInfo?._id === userId ? classes["user-profile-self"] : ""
      }`}
      style={style}
    >
      {avatarImageUrl ? (
        <img
          className={classes["user-profile-header-img"]}
          src={avatarImageUrl}
        />
      ) : (
        <div
          className={classes["user-profile-header-color"]}
          style={{ backgroundColor: avatarColor || "#ccc" }}
        ></div>
      )}

      <div className={classes["user-profile-info"]}>
        {userInfo?._id === userId ? (
          <>
            <div className={classes["user-profile-info-avatar-wrapper"]}>
              {avatarImageUrl ? (
                <img
                  className={classes["user-profile-info-avatar-img"]}
                  src={avatarImageUrl}
                />
              ) : (
                <div
                  className={classes["user-profile-info-avatar-color"]}
                  style={{ backgroundColor: avatarColor || "#ccc" }}
                >
                  {nickname.charAt(0)}
                </div>
              )}
              <div
                className={
                  onlineChecked
                    ? classes["user-profile-info-online-dot"]
                    : classes["user-profile-info-offline-dot"]
                }
              />
            </div>
            <div className={classes["user-profile-info-content"]}>
              <div className={classes["user-profile-nickname"]}>
                <div>{nickname}</div>
              </div>
              <div className={classes["user-profile-edit-wrapper"]}>
                <button
                  className={classes["user-profile-edit-button"]}
                  onClick={userProfileEditHandler}
                >
                  프로필 편집
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={classes["user-profile-info-avatar-wrapper"]}>
              {avatarImageUrl ? (
                <img
                  className={classes["user-profile-info-avatar-img"]}
                  src={avatarImageUrl}
                />
              ) : (
                <div
                  className={classes["user-profile-info-avatar-color"]}
                  style={{ backgroundColor: avatarColor || "#ccc" }}
                >
                  {nickname.charAt(0)}
                </div>
              )}
              <div
                className={
                  onlineChecked
                    ? classes["user-profile-info-online-dot"]
                    : classes["user-profile-info-offline-dot"]
                }
              />
            </div>
            <div className={classes["user-profile-info-content"]}>
              <div
                className={classes["user-profile-nickname"]}
                onClick={() => userProfileDetailsHandler("friends")}
              >
                {nickname}
              </div>
              <div className={classes["user-profile-mutual-wrapper"]}>
                <span
                  className={classes["user-profile-mutual-friends"]}
                  onClick={() => userProfileDetailsHandler("friends")}
                >
                  같이 아는 친구 {mutualFriends.length}명
                </span>
                <span className={classes["user-profile-mutual-group-chats"]}>
                  <span
                    className={classes["user-profile-mutual-group-chats-text"]}
                    onClick={() => userProfileDetailsHandler("groups")}
                  >
                    같이 있는 채팅방 {mutualGroupChats.length}개
                  </span>
                </span>
              </div>
              <UserProfileChatInput
                key={`${userId}-${origin}`}
                userId={userId}
                nickname={nickname}
                avatarColor={avatarColor}
                avatarImageUrl={avatarImageUrl}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
