import { useState } from "react";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import AddFriend from "./AddFriend";
import Friend from "./Friend";
import PendingFriends from "./PendingFriends";

const Friends = () => {
  const { userInfo } = useAuthStore();
  const { friends, loadFriend, friendRequests, loadFriendRequests } =
    useFriendStore();

  const [toggle, setToggle] = useState(false);

  const toggleHandler = () => {
    setToggle(!toggle);
  };

  const userId = userInfo?._id;

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  console.log(filteredFriends);

  return (
    <>
      {/* <button>온라인</button> */}
      <button onClick={loadFriend}>모두</button>
      <button onClick={loadFriendRequests}>대기 중</button>
      <button onClick={toggleHandler}>친구 추가하기</button>
      {toggle &&
        filteredFriends.map((friend) => (
          <Friend key={friend.id} id={friend.id} nickname={friend.nickname} />
        ))}
      {toggle &&
        friendRequests.map((friendRequest) => (
          <PendingFriends
            key={friendRequest._id}
            friendRequestId={friendRequest._id}
            requester={friendRequest.requester}
            requesterNickname={friendRequest.requesterNickname}
            receiver={friendRequest.receiver}
            receiverNickname={friendRequest.receiverNickname}
            status={friendRequest.status}
          />
        ))}
      {toggle && <AddFriend />}
    </>
  );
};

export default Friends;
