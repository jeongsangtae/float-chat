import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import useLayoutStore from "../../store/layoutStore";
import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useDirectChatStore from "../../store/directChatStore";
import useGroupChatStore from "../../store/groupChatStore";

import ChatInput from "../Chats/ChatInput";
import Chats from "../Chats/Chats";

import classes from "./DirectChatDetails.module.css";
import DirectChatPanel from "./DirectChatPanel";

const DirectChatDetails = () => {
  const { roomId } = useParams<{ roomId: string }>();

  const { setView } = useLayoutStore();
  const { userInfo } = useAuthStore();
  const {
    friends,
    loadFriends,
    otherUserFriends,
    onlineFriends,
    loadOtherUserFriends,
  } = useFriendStore();
  const { directChats } = useDirectChatStore();
  const { groupChats } = useGroupChatStore();

  const directChat = directChats.find(
    (directChat) => directChat._id === roomId
  );

  const otherUser = directChat?.participants.find(
    (participant) => participant._id !== userInfo?._id
  );

  useEffect(() => {
    setView("directChat");
    loadFriends();
  }, []);

  useEffect(() => {
    if (otherUser?._id) {
      loadOtherUserFriends(otherUser?._id);
    }
  }, [otherUser?._id]);

  const friendSince = useMemo(() => {
    const friendSinceDateStr = friends.find((friend) => {
      return (
        (friend.requester.id === userInfo?._id &&
          friend.receiver.id === otherUser?._id) ||
        (friend.requester.id === otherUser?._id &&
          friend.receiver.id === userInfo?._id)
      );
    })?.date;

    if (!friendSinceDateStr) return null;

    const [friendSinceDate] = friendSinceDateStr.split(" ");
    const [year, month, day] = friendSinceDate.split(".");

    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  }, [friends, userInfo?._id, otherUser?._id]);

  const onlineChecked = useMemo(() => {
    return onlineFriends.some((onlineFriend) => {
      const targetId =
        onlineFriend.requester.id === userInfo?._id
          ? onlineFriend.receiver.id
          : onlineFriend.requester.id;
      return targetId === otherUser?._id;
    });
  }, [onlineFriends, userInfo?._id, otherUser?._id]);

  const mutualGroupChats = groupChats.filter((groupChat) => {
    if (!userInfo || !otherUser) return false;

    const users = groupChat.users ?? [];

    return users.includes(userInfo._id) && users.includes(otherUser._id);
  });

  const mutualFriends = useMemo(() => {
    return friends.filter((friend) => {
      const userFriendId =
        friend.requester.id === userInfo?._id
          ? friend.receiver.id
          : friend.requester.id;

      if (userFriendId === otherUser?._id) return false;

      return otherUserFriends.some((otherUserFriend) => {
        const otherUserFriendId =
          otherUserFriend.requester.id === otherUser?._id
            ? otherUserFriend.receiver.id
            : otherUserFriend.requester.id;

        return (
          otherUserFriendId === userFriendId &&
          otherUserFriendId !== userInfo?._id // 나 자신도 제외
        );
      });
    });
  }, [friends, otherUserFriends, userInfo?._id, otherUser?._id]);

  // 사용자와 다른 사용자 모두와 친구인 사용자 목록
  // 각 객체는 함께 아는 친구 정보, 나 그리고 해당 사용자 간의 1:1 채팅방 ID를 포함
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

      // 함께 아는 친구 정보 + roomId + 온라인 유무 반환
      return {
        ...mutualFriendInfo,
        roomId: directChat?._id ?? "",
        onlineChecked: mutualFriendOnlineChecked,
      };
    });
  }, [mutualFriends, directChats, onlineFriends, userInfo?._id]);

  return (
    <div className={classes["direct-chat-detail-wrapper"]}>
      <div className={classes["direct-chat-area"]}>
        <Chats
          roomId={roomId}
          chatInfo={{
            type: "direct",
            nickname: otherUser?.nickname,
            avatarColor: otherUser?.avatarColor ?? null,
            avatarImageUrl: otherUser?.avatarImageUrl ?? null,
          }}
        />
        <ChatInput roomId={roomId} />
      </div>

      <DirectChatPanel
        chatInfo={{
          type: "direct",
          userId: otherUser?._id,
          nickname: otherUser?.nickname,
          avatarColor: otherUser?.avatarColor ?? null,
          avatarImageUrl: otherUser?.avatarImageUrl ?? null,
        }}
        onlineChecked={onlineChecked}
        friendSince={friendSince ?? ""}
        mutualGroupChats={mutualGroupChats}
        mutualFriendUsers={mutualFriendUsers}
      />
    </div>
  );
};

export default DirectChatDetails;
