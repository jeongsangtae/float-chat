import { useState, useEffect } from "react";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import AddFriend from "./AddFriend";
import Friend from "./Friend";
import PendingFriends from "./PendingFriends";

const Friends = () => {
  const { userInfo } = useAuthStore();
  const { friends, loadFriends, friendRequests, loadFriendRequests } =
    useFriendStore();

  const [activeTab, setActiveTab] = useState(null);

  // useEffect(() => {
  //   if (userInfo && activeTab === null) {
  //     toggleHandler("all", loadFriends);
  //   }
  // }, [userInfo]);

  useEffect(() => {
    toggleHandler("all", loadFriends);
  }, []);

  const toggleHandler = (tab, action) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      action?.();
    }
  };

  const userId = userInfo?._id;

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  console.log(filteredFriends);

  return (
    <>
      {/* <button>온라인</button> */}
      <button onClick={() => toggleHandler("all", loadFriends)}>모두</button>
      <button onClick={() => toggleHandler("pending", loadFriendRequests)}>
        대기 중
      </button>
      <button onClick={() => toggleHandler("addFriend")}>친구 추가하기</button>
      {activeTab === "all" &&
        filteredFriends.map((friend) => (
          <Friend key={friend.id} id={friend.id} nickname={friend.nickname} />
        ))}
      {activeTab === "pending" &&
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
      {activeTab === "addFriend" && <AddFriend />}
    </>
  );
};

export default Friends;
