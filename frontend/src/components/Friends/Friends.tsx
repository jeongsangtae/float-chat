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

  const onlineFriendIds = onlineFriends.map((onlineFriend) =>
    onlineFriend.requester.id === userId
      ? onlineFriend.receiver.id
      : onlineFriend.requester.id
  );

  const filteredOnlineFriends = onlineFriends.map((onlineFriend) => {
    const onlineFriendInfo =
      onlineFriend.requester.id === userId
        ? onlineFriend.receiver
        : onlineFriend.requester;

    return {
      ...onlineFriendInfo,
      onlineChecked: true,
    };
  });

  const filteredFriends = friends.map((friend) => {
    const friendInfo =
      friend.requester.id === userId ? friend.receiver : friend.requester;

    const onlineChecked = onlineFriendIds.includes(friendInfo.id);

    return {
      ...friendInfo,
      onlineChecked,
    };
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

  const searchFriendRequests = friendRequests.filter((friendRequest) => {
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
  });

  const sendFriendRequests = searchFriendRequests.map((searchFriendRequest) => {
    const sendRequest = userId === searchFriendRequest.requester;

    if (sendRequest) {
      return {
        id: searchFriendRequest._id,
        nickname: searchFriendRequest.receiverNickname,
        avatarColor: searchFriendRequest.receiverAvatarColor,
        sendRequest: sendRequest,
      };
    } else {
      return {
        id: searchFriendRequest._id,
        nickname: searchFriendRequest.requesterNickname,
        avatarColor: searchFriendRequest.requesterAvatarColor,
        sendRequest: sendRequest,
      };
    }
  });

  // 내가 보낸 요청: sendRequest === true
  const sentRequests = sendFriendRequests.filter(
    (sendFriendRequest) => sendFriendRequest.sendRequest
  );

  // 내가 받은 요청: sendRequest === false
  const receiverRequests = sendFriendRequests.filter(
    (sendFriendRequest) => !sendFriendRequest.sendRequest
  );

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
            {friendRequests.length > 0 && (
              <button
                onClick={() => activeTabHandler("pending", loadFriendRequests)}
                className={activeTab === "pending" ? classes.active : ""}
              >
                대기 중
                {receiverRequests.length > 0 && (
                  <div className={classes["friend-request-badge"]}>
                    <span className={classes["friend-request-count"]}>
                      {receiverRequests.length > 99
                        ? "99"
                        : receiverRequests.length}
                    </span>
                  </div>
                )}
              </button>
            )}

            <button
              onClick={() => activeTabHandler("addFriend")}
              className={activeTab === "addFriend" ? classes.active : ""}
            >
              친구 추가하기
            </button>
          </div>

          <div className={classes["friend-content"]}>
            {activeTab !== "addFriend" &&
              // 검색창은 대기중 탭이면서 friendRequests 없을 땐 숨김
              !(activeTab === "pending" && friendRequests.length === 0) && (
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
              )}

            <ul className={classes["online-friends"]}>
              {activeTab === "online" &&
                searchOnlineFriends.map((onlineFriend) => (
                  <OnlineFriend
                    key={onlineFriend.id}
                    userId={userInfo?._id ?? ""}
                    id={onlineFriend.id}
                    nickname={onlineFriend.nickname}
                    avatarColor={onlineFriend.avatarColor}
                    onlineChecked={onlineFriend.onlineChecked}
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
                    nickname={friend.nickname}
                    avatarColor={friend.avatarColor}
                    onlineChecked={friend.onlineChecked}
                  />
                ))}
            </ul>

            <ul className={classes["pending-friends"]}>
              {activeTab === "pending" && (
                <>
                  {friendRequests.length === 0 ? (
                    <div>
                      대기 중인 친구 요청이 없어요. <br />
                      <strong>'친구 추가하기'</strong>를 클릭해 친구 요청을
                      보내세요.
                    </div>
                  ) : (
                    <>
                      <div>
                        {receiverRequests.length > 0 && (
                          <div>
                            <span>받음</span>
                            <span>ㅡ</span>
                            <span>{receiverRequests.length}</span>
                          </div>
                        )}
                        {receiverRequests.map((receiverRequest) => (
                          <PendingFriends
                            key={receiverRequest.id}
                            friendRequestId={receiverRequest.id}
                            nickname={receiverRequest.nickname}
                            avatarColor={receiverRequest.avatarColor}
                            sendRequest={receiverRequest.sendRequest}
                          />
                        ))}
                      </div>

                      <div>
                        {sentRequests.length > 0 && (
                          <div>
                            <span>보냄</span>
                            <span>ㅡ</span>
                            <span>{sentRequests.length}</span>
                          </div>
                        )}
                        {sentRequests.map((sentRequest) => (
                          <PendingFriends
                            key={sentRequest.id}
                            friendRequestId={sentRequest.id}
                            nickname={sentRequest.nickname}
                            avatarColor={sentRequest.avatarColor}
                            sendRequest={sentRequest.sendRequest}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </ul>

            {activeTab === "addFriend" && <AddFriend />}
          </div>
        </>
      </div>
    </>
  );
};

export default Friends;
