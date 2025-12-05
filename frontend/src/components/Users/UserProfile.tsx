import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useGroupChatStore from "../../store/groupChatStore";

import { UserProfileProps } from "../../types";

import Avatar from "./Avatar";

import classes from "./UserProfile.module.css";

const UserProfile = ({
  userId,
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  style,
}: UserProfileProps) => {
  // 그룹 채팅방 내의 사용자를 클릭하면 보여지는 내용

  // 아바타 (온라인 유무 포함), 친구 관계 여부, 닉네임, 같이 아는 친구 수, 같이 참여한 채팅방 수, 다이렉트 채팅 메시지를 보내는 입력창으로 구성될 예정

  const { userInfo } = useAuthStore();
  const { friends, loadFriends, otherUserFriends, loadOtherUserFriends } =
    useFriendStore();
  const { groupChats } = useGroupChatStore();

  const mutualGroupChats = groupChats.filter((groupChat) => {
    if (!userInfo || !userId) return false;

    const users = groupChat.users ?? [];

    return users.includes(userInfo._id) && users.includes(userId);
  });

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
          <div>
            <Avatar
              nickname={nickname}
              avatarImageUrl={avatarImageUrl}
              avatarColor={avatarColor}
              onlineChecked={onlineChecked}
              showOnlineDot={true}
              extraClass="user-profile-info-avatar"
            />
            <div>{nickname}</div>
            <div>프로필 편집</div>
          </div>
        ) : (
          <div>
            <Avatar
              nickname={nickname}
              avatarImageUrl={avatarImageUrl}
              avatarColor={avatarColor}
              onlineChecked={onlineChecked}
              showOnlineDot={true}
              extraClass="user-profile-info-avatar"
            />
            <div>{nickname}</div>
            <div>{mutualGroupChats.length}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
