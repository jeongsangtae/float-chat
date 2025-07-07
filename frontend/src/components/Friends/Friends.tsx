import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useLayoutStore from "../../store/layoutStore";

import AddFriend from "./AddFriend";
import Friend from "./Friend";
import OnlineFriend from "./OnlineFriend";
import PendingFriends from "./PendingFriends";

import classes from "./Friends.module.css";

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

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { setView } = useLayoutStore();

  useEffect(() => {
    // activeTabHandler("all", loadFriends);
    activeTabHandler("online", loadOnlineFriends);
    loadFriendRequests();
    setView("friends");
  }, []);

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

  const searchOnlineFriends = filteredOnlineFriends.filter(
    (friendData) =>
      friendData.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendData.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const searchFriends = filteredFriends.filter(
    (friendData) =>
      friendData.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendData.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const searchFriendRequests = friendRequests.filter(
  //   (friendData) =>
  //     friendData.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     friendData.email?.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const filteredFriends = friends
  //   .map((friend) => {
  //     return friend.requester.id === userId
  //       ? friend.receiver
  //       : friend.requester;
  //   })
  //   .filter(
  //     (friend, index, self) =>
  //       friend.id !== userId &&
  //       index === self.findIndex((f) => f.id === friend.id)
  //   );

  return (
    <>
      <div className={classes["friend-menu"]}>
        <>
          <div className={classes["friend-submenu"]}>
            <button
              onClick={() => activeTabHandler("online", loadOnlineFriends)}
              className={activeTab === "online" ? classes.active : ""}
            >
              온라인
            </button>
            <button
              onClick={() => activeTabHandler("all", loadFriends)}
              className={activeTab === "all" ? classes.active : ""}
            >
              모두
            </button>
            <button
              onClick={() => activeTabHandler("pending", loadFriendRequests)}
              className={activeTab === "pending" ? classes.active : ""}
            >
              대기 중{" "}
              {friendRequests.length > 0 && `(${friendRequests.length})`}
            </button>
            <button
              onClick={() => activeTabHandler("addFriend")}
              className={activeTab === "addFriend" ? classes.active : ""}
            >
              친구 추가하기
            </button>
          </div>

          <div className={classes["friend-content"]}>
            <div className={classes["friend-search"]}>
              <input
                type="text"
                className={classes["friend-search-input"]}
                placeholder="친구 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm ? (
                <IoClose
                  className={classes["friend-search-delete-icon"]}
                  onClick={() => setSearchTerm("")}
                />
              ) : (
                <IoIosSearch className={classes["friend-search-icon"]} />
              )}
            </div>

            <ul className={classes["online-friends"]}>
              {activeTab === "online" &&
                searchOnlineFriends.map((friend) => (
                  <OnlineFriend
                    key={friend.id}
                    userId={userInfo?._id ?? ""}
                    id={friend.id}
                    // email={friend.email}
                    nickname={friend.nickname}
                    avatarColor={friend.avatarColor}
                  />
                ))}
            </ul>

            <ul className={classes.friends}>
              {activeTab === "all" &&
                searchFriends.map((friend) => (
                  <Friend
                    key={friend.id}
                    userId={userInfo?._id ?? ""}
                    id={friend.id}
                    // email={friend.email}
                    nickname={friend.nickname}
                    avatarColor={friend.avatarColor}
                  />
                ))}
            </ul>

            <ul className={classes["pending-friends"]}>
              {activeTab === "pending" &&
                friendRequests.map((friendRequest) => (
                  <PendingFriends
                    key={friendRequest._id}
                    friendRequestId={friendRequest._id}
                    requester={friendRequest.requester}
                    requesterNickname={friendRequest.requesterNickname}
                    requesterAvatarColor={friendRequest.requesterAvatarColor}
                    receiver={friendRequest.receiver}
                    receiverNickname={friendRequest.receiverNickname}
                    receiverAvatarColor={friendRequest.receiverAvatarColor}
                    status={friendRequest.status}
                  />
                ))}
            </ul>
            {activeTab === "addFriend" && <AddFriend />}
          </div>
        </>
      </div>
    </>
  );
};

export default Friends;
