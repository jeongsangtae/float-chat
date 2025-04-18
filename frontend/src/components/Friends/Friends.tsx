import { useState, useEffect } from "react";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";

import AddFriend from "./AddFriend";
import Friend from "./Friend";
import OnlineFriend from "./OnlineFriend";
import PendingFriends from "./PendingFriends";

const Friends = () => {
  const { userInfo } = useAuthStore();
  const {
    onlineFriends,
    friends,
    loadOnlineFriends,
    loadFriends,
    friendRequests,
    loadFriendRequests,
  } = useFriendStore();

  const [toggleFriend, setToggleFriend] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    activeTabHandler("all", loadFriends);
    loadFriendRequests();
  }, []);

  const friendToggleHandler = (): void => {
    setToggleFriend(!toggleFriend);
  };

  const activeTabHandler = (tab: string, action?: () => void): void => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      action?.();
    }
  };

  const userId = userInfo?._id;

  const filteredOnlineFriends = onlineFriends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  const filteredFriends = friends.map((friend) => {
    return friend.requester.id === userId ? friend.receiver : friend.requester;
  });

  return (
    <>
      {/* <button>온라인</button> */}
      <button onClick={friendToggleHandler}>친구</button>
      {toggleFriend && (
        <>
          <button onClick={() => activeTabHandler("online", loadOnlineFriends)}>
            온라인
          </button>
          <button onClick={() => activeTabHandler("all", loadFriends)}>
            모두
          </button>
          <button
            onClick={() => activeTabHandler("pending", loadFriendRequests)}
          >
            대기 중 {friendRequests.length > 0 && `(${friendRequests.length})`}
          </button>
          <button onClick={() => activeTabHandler("addFriend")}>
            친구 추가하기
          </button>
          {activeTab === "online" &&
            filteredOnlineFriends.map((friend) => (
              <OnlineFriend
                key={friend.id}
                userId={userInfo?._id ?? ""}
                id={friend.id}
                nickname={friend.nickname}
              />
            ))}
          {activeTab === "all" &&
            filteredFriends.map((friend) => (
              <Friend
                key={friend.id}
                userId={userInfo?._id ?? ""}
                id={friend.id}
                nickname={friend.nickname}
              />
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
      )}
    </>
  );
};

export default Friends;
