import { useState } from "react";
import AddFriend from "./AddFriend";

const Friends = () => {
  const [toggle, setToggle] = useState(false);

  const AddFriendHandler = () => {
    setToggle(!toggle);
  };

  return (
    <>
      <button>온라인</button>
      <button>모두</button>
      <button>대기 중</button>
      <button onClick={AddFriendHandler}>친구 추가하기</button>

      {toggle && <AddFriend />}
    </>
  );
};

export default Friends;
