import { useMemo } from "react";

import { Friend, FriendUser, FriendRequest } from "../../../types";

const useFilteredFriends = (
  friends: Friend[],
  onlineFriends: Friend[],
  friendRequests: FriendRequest[],
  userId: string,
  searchTerm: string
) => {
  // 온라인 친구 ID 목록 추출
  const onlineFriendIds = useMemo(() => {
    return onlineFriends.map((onlineFriend) =>
      onlineFriend.requester.id === userId
        ? onlineFriend.receiver.id
        : onlineFriend.requester.id
    );
  }, [onlineFriends, userId]);

  // 검색어가 적용된 온라인 친구 목록 생성
  const filteredOnlineFriends = useMemo(() => {
    return onlineFriends
      .map((onlineFriend) =>
        onlineFriend.requester.id === userId
          ? onlineFriend.receiver
          : onlineFriend.requester
      )
      .filter(
        (onlineFriend) =>
          onlineFriend.nickname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          onlineFriend.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((onlineFriend) => ({ ...onlineFriend, onlineChecked: true }));
  }, [onlineFriends, userId, searchTerm]);

  // 검색어가 적용된 전체 친구 목록 생성
  const filteredFriends = useMemo(() => {
    const friendsList = friends
      .map((friend) =>
        friend.requester.id === userId ? friend.receiver : friend.requester
      )
      .filter(
        (friend) =>
          friend.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          friend.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((friend) => ({
        ...friend,
        onlineChecked: onlineFriendIds.includes(friend.id),
      }));

    // 친구 ID를 기준으로 고유한 친구만 추출 (중복 제거)
    const uniqueMapId = new Map<string, Omit<FriendUser, "userId">>();

    for (const friend of friendsList) {
      uniqueMapId.set(friend.id, friend); // 동일한 ID가 있으면 나중 것이 덮어씀
    }

    return Array.from(uniqueMapId.values());
  }, [friends, userId, onlineFriendIds, searchTerm]);

  // 보낸 요청 / 받은 요청 목록 생성
  const sendFriendRequests = useMemo(() => {
    return friendRequests
      .filter((friendRequest) => {
        const currentRequester = friendRequest.requester === userId;

        const nickname = currentRequester
          ? friendRequest.receiverNickname
          : friendRequest.requesterNickname;
        const email = currentRequester
          ? friendRequest.receiverEmail
          : friendRequest.requesterEmail;

        return (
          nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .map((friendRequest) => {
        const sendRequest = friendRequest.requester === userId;

        return {
          id: friendRequest._id,
          nickname: sendRequest
            ? friendRequest.receiverNickname
            : friendRequest.requesterNickname,
          avatarColor: sendRequest
            ? friendRequest.receiverAvatarColor
            : friendRequest.requesterAvatarColor,
          avatarImageUrl: sendRequest
            ? friendRequest.receiverAvatarImageUrl
            : friendRequest.requesterAvatarImageUrl,
          sendRequest,
        };
      });
  }, [friendRequests, searchTerm, userId]);

  // 내가 보낸 친구 요청
  const sentRequests = sendFriendRequests.filter(
    (sendFriendRequest) => sendFriendRequest.sendRequest
  );

  // 받은 친구 요청
  const receivedRequests = sendFriendRequests.filter(
    (sendFriendRequest) => !sendFriendRequest.sendRequest
  );

  return {
    filteredOnlineFriends,
    filteredFriends,
    sentRequests,
    receivedRequests,
  };
};

export default useFilteredFriends;
