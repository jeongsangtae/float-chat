import { useEffect, useMemo } from "react";

import DirectChat from "./DirectChat";
import useAuthStore from "../../store/authStore";
import useGroupChatStore from "../../store/groupChatStore";
import useDirectChatStore from "../../store/directChatStore";
import useFriendStore from "../../store/friendStore";
import GroupChatInviteList from "../GroupChats/GroupChatInviteList";

import classes from "./DirectChats.module.css";

const DirectChats = () => {
  const { isLoggedIn, userInfo } = useAuthStore();
  const { getGroupChatInvites, groupChatInvites } = useGroupChatStore();
  const { directChats, getDirectChat } = useDirectChatStore();
  const { onlineFriends, loadOnlineFriends } = useFriendStore();

  // 로그인 시 그룹 채팅 초대, 다이렉트 채팅, 온라인 친구 목록 조회
  useEffect(() => {
    if (isLoggedIn) {
      getGroupChatInvites();
      getDirectChat();
      loadOnlineFriends();
    }
  }, [isLoggedIn]);

  // 다이렉트 채팅 목록에 상대방 정보와 온라인 상태 추가
  const filteredDirectChats = useMemo(() => {
    // 온라인 상태인 친구들의 ID 목록 추출
    const onlineFriendIds = onlineFriends.map((friend) =>
      friend.requester.id === userInfo?._id
        ? friend.receiver.id
        : friend.requester.id
    );

    return directChats.map((directChat) => {
      // 현재 로그인한 사용자를 제외한 상대방 정보 추출
      const otherUser = directChat.participants.find(
        (participant) => participant._id !== userInfo?._id
      );

      // 상대방의 온라인 여부 확인
      const onlineChecked = onlineFriendIds.includes(otherUser?._id ?? "");

      return {
        ...directChat,
        otherUser,
        onlineChecked,
      };
    });
  }, [directChats, onlineFriends, userInfo?._id]);

  return (
    <>
      <div>
        {/* 다이렉트 채팅 목록 */}
        {filteredDirectChats.map((filteredDirectChat) => (
          <DirectChat
            key={filteredDirectChat._id}
            _id={filteredDirectChat._id}
            otherUserId={filteredDirectChat.otherUser?._id ?? ""}
            otherUserNickname={
              filteredDirectChat.otherUser?.nickname ?? "알 수 없음"
            }
            otherUserAvatarColor={
              filteredDirectChat.otherUser?.avatarColor ?? "#ccc"
            }
            otherUserAvatarImageUrl={
              filteredDirectChat.otherUser?.avatarImageUrl ?? ""
            }
            onlineChecked={filteredDirectChat.onlineChecked}
          />
        ))}
      </div>

      {/* 그룹 채팅 초대 목록 */}
      {groupChatInvites.length > 0 && (
        <div className={classes["group-chat-invite-section"]}>
          <div className={classes["group-chat-invite-header"]}>그룹 초대</div>
          <ul className={classes["group-chat-invite-list"]}>
            {groupChatInvites.map((groupChatInvite) => (
              <GroupChatInviteList
                key={groupChatInvite._id}
                groupChatId={groupChatInvite.roomId}
                groupChatInviteId={groupChatInvite._id}
                requester={groupChatInvite.requester}
                requesterNickname={groupChatInvite.requesterNickname}
                roomTitle={groupChatInvite.roomTitle}
                status={groupChatInvite.status}
                kstDate={groupChatInvite.kstDate}
                participantCount={groupChatInvite.participantCount}
                avatarColor={groupChatInvite.avatarColor}
                avatarImageUrl={groupChatInvite.avatarImageUrl}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default DirectChats;
