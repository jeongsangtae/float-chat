import { useState } from "react";

import useFriendStore from "../../store/friendStore";

import AddFriend from "./AddFriend";
import PendingFriends from "./PendingFriends";

const Friends = () => {
  const { friendRequests, loadFriendRequests } = useFriendStore();

  const [toggle, setToggle] = useState(false);

  const toggleHandler = () => {
    setToggle(!toggle);
  };

  console.log(friendRequests);

  return (
    <>
      {/* <button>온라인</button> */}
      <button>모두</button>
      <button onClick={loadFriendRequests}>대기 중</button>
      <button onClick={toggleHandler}>친구 추가하기</button>
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
