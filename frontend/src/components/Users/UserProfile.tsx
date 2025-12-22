import { useEffect, useMemo } from "react";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";
import useModalStore from "../../store/modalStore";

import UserProfileChatInput from "../Chats/UserProfileChatInput";
import EditUserProfileForm from "./EditUserProfileForm";
import UserProfileDetails from "./UserProfileDetails";

import { UserProfileProps } from "../../types";

import classes from "./UserProfile.module.css";
import useDirectChatStore from "../../store/directChatStore";

const UserProfile = ({
  userId,
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  onOpenUserProfileDetails,
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
  const { activeModal, toggleModal } = useModalStore();

  // useEffect(() => {
  //   loadFriends();
  // }, []);

  useEffect(() => {
    loadFriends();

    if (userId) {
      loadOtherUserFriends(userId);
    }

    getDirectChat();
  }, [userId]);

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

  // console.log(friends);

  // console.log(otherUserFriends);

  // console.log(mutualFriends);

  console.log(mutualFriendUsers);

  // console.log(mutualGroupChats);

  const userProfileEditHandler = (): void => {
    toggleModal("editUserProfileForm", "PATCH", {
      _id: userInfo?._id,
      nickname: userInfo?.nickname,
      avatarColor: userInfo?.avatarColor,
      avatarImageUrl: userInfo?.avatarImageUrl,
    });
  };

  const userProfileDetailsHandler = (view: "friends" | "groups"): void => {
    onOpenUserProfileDetails({
      view,
      userId,
      nickname,
      avatarImageUrl,
      avatarColor,
      onlineChecked,
      mutualFriendUsers,
      mutualGroupChats,
    });
    // toggleModal("userProfileDetails", undefined, {
    //   userId,
    //   nickname,
    //   avatarImageUrl,
    //   avatarColor,
    //   onlineChecked,
    //   // mutualFriends,
    //   mutualFriendUsers,
    //   mutualGroupChats,
    //   initialView: view,
    // });
  };

  return (
    <div className={classes["user-profile-wrapper"]} style={style}>
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
              <div>{nickname}</div>
              <button onClick={userProfileEditHandler}>프로필 편집</button>
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
              <div onClick={() => userProfileDetailsHandler("friends")}>
                {nickname}
              </div>
              <span onClick={() => userProfileDetailsHandler("friends")}>
                같이 아는 친구 {mutualFriends.length}
              </span>
              <span> · </span>
              <span onClick={() => userProfileDetailsHandler("groups")}>
                같이 있는 그룹 채팅방{mutualGroupChats.length}
              </span>
              <UserProfileChatInput
                userId={userId}
                nickname={nickname}
                avatarColor={avatarColor}
                avatarImageUrl={avatarImageUrl}
              />
            </div>
          </>
        )}
      </div>
      {/* {activeModal === "editUserProfileForm" && (
        <EditUserProfileForm
          onToggle={() => toggleModal("editUserProfileForm")}
        />
      )}

      {activeModal === "userProfileDetails" && (
        <UserProfileDetails
          onToggle={() => toggleModal("userProfileDetails")}
        />
      )} */}
    </div>
  );
};

export default UserProfile;
