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

  // 현재 다이렉트 채팅방 정보 조회
  const directChat = directChats.find(
    (directChat) => directChat._id === roomId
  );

  // 현재 채팅 상대 사용자 정보 조회
  const otherUser = directChat?.participants.find(
    (participant) => participant._id !== userInfo?._id
  );

  // 화면 레이아웃 설정 및 친구 목록 조회
  useEffect(() => {
    setView("directChat");
    loadFriends();
  }, []);

  // 상대방 친구 목록 조회
  useEffect(() => {
    if (otherUser?._id) {
      loadOtherUserFriends(otherUser?._id);
    }
  }, [otherUser?._id]);

  // 친구된 날짜 조회
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

  // 온라인 상태의 친구 확인
  const onlineChecked = useMemo(() => {
    return onlineFriends.some((onlineFriend) => {
      const targetId =
        onlineFriend.requester.id === userInfo?._id
          ? onlineFriend.receiver.id
          : onlineFriend.requester.id;
      return targetId === otherUser?._id;
    });
  }, [onlineFriends, userInfo?._id, otherUser?._id]);

  // 함께 참여한 그룹 채팅방 목록 추출
  const mutualGroupChats = groupChats.filter((groupChat) => {
    if (!userInfo || !otherUser) return false;

    // users가 없는 경우를 대비해 빈 배열 사용
    const users = groupChat.users ?? [];

    return users.includes(userInfo._id) && users.includes(otherUser._id);
  });

  // 함께 아는 친구 목록 추출
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

  // 함께 아는 친구 목록을 화면에 표시할 형태로 가공
  // (친구 정보 + 다이렉트 채팅방 ID + 온라인 여부)
  const mutualFriendUsers = useMemo(() => {
    return mutualFriends.map((mutualFriend) => {
      // mutualFriend에서 "나"가 아닌 함께 아는 친구 정보 추출
      const mutualFriendInfo =
        mutualFriend.requester.id === userInfo?._id
          ? mutualFriend.receiver
          : mutualFriend.requester;

      // 함께 아는 친구 온라인 상태 확인
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
