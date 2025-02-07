import { useState } from "react";

import useFriendStore from "../../store/friendStore";

import AddFriend from "./AddFriend";
import PendingFriends from "./PendingFriends";

const Friends = () => {
  const { friendRequests, loadFriendRequests } = useFriendStore();

  const [toggle, setToggle] = useState(false);

  const AddFriendHandler = () => {
    setToggle(!toggle);
  };

  console.log(friendRequests);

  return (
    <>
      {/* <button>온라인</button> */}
      <button>모두</button>
      <button onClick={loadFriendRequests}>대기 중</button>
      <button onClick={AddFriendHandler}>친구 추가하기</button>
      {toggle &&
        friendRequests.map((friendRequest) => (
          <PendingFriends
            key={friendRequest._id}
            sender={friendRequest.sender}
            senderEmail={friendRequest.senderEmail}
            receiver={friendRequest.receiver}
            receiverEmail={friendRequest.receiverEmail}
            status={friendRequest.status}
          />
        ))}
      {toggle && <AddFriend />}
    </>
  );
};

export default Friends;
