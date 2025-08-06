import { useMemo } from "react";

import { Friend, FriendUser, FriendRequest } from "../../../types";

const useFilteredFriends = (
  friends: Friend[],
  onlineFriends: Friend[],
  friendRequests: FriendRequest[],
  userId: string,
  searchTerm: string
) => {
  const onlineFriendIds = useMemo(() => {
    return onlineFriends.map((onlineFriend) =>
      onlineFriend.requester.id === userId
        ? onlineFriend.receiver.id
        : onlineFriend.requester.id
    );
  }, [onlineFriends, userId]);

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

  // const filteredFriends = useMemo(() => {
  //   return friends
  //     .map((friend) =>
  //       friend.requester.id === userId ? friend.receiver : friend.requester
  //     )
  //     .filter(
  //       (friend) =>
  //         friend.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         friend.email?.toLowerCase().includes(searchTerm.toLowerCase())
  //     )
  //     .map((friend) => ({
  //       ...friend,
  //       onlineChecked: onlineFriendIds.includes(friend.id),
  //     }));
  // }, [friends, userId, onlineFriendIds, searchTerm]);

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
          sendRequest,
        };
      });
  }, [friendRequests, searchTerm, userId]);

  const sentRequests = sendFriendRequests.filter(
    (sendFriendRequest) => sendFriendRequest.sendRequest
  );

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
