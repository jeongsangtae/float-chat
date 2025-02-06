import { useState } from "react";
import AddFriend from "./AddFriend";
import useFriendStore from "../../store/friendStore";

const Friends = () => {
  const { friendRequests, loadFriendRequests } = useFriendStore();

  const [toggle, setToggle] = useState(false);

  const AddFriendHandler = () => {
    setToggle(!toggle);
  };

  console.log(friendRequests);

  return (
    <>
      <button>온라인</button>
      <button>모두</button>
      <button onClick={loadFriendRequests}>대기 중</button>
      <button onClick={AddFriendHandler}>친구 추가하기</button>
      {toggle &&
        friendRequests.map((friendRequest) => (
          <ul>
            <li>{friendRequest.receiverEmail}</li>
            <li>{friendRequest.status}</li>
          </ul>
        ))}
      {toggle && <AddFriend />}
    </>
  );
};

export default Friends;
