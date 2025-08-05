import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoClose } from "react-icons/io5";

import useAuthStore from "../../store/authStore";
import useFriendStore from "../../store/friendStore";
import useLayoutStore from "../../store/layoutStore";
import useFilteredFriends from "./hooks/useFilteredFriends";

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

  const userId = userInfo?._id ?? "";

  const {
    filteredOnlineFriends,
    filteredFriends,
    sentRequests,
    receivedRequests,
  } = useFilteredFriends(
    friends,
    onlineFriends,
    friendRequests,
    userId,
    searchTerm
  );

  useEffect(() => {
    // activeTabHandler("all", loadFriends);
    activeTabHandler("online", loadOnlineFriends);
    loadFriendRequests();
    setView("friends");
  }, []);

  // 친구 목록에서 중복된 ID 확인하는 체크용 useEffect
  useEffect(() => {
    const ids = filteredFriends.map((f) => f.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      console.warn("🔁 중복된 친구 ID:", duplicates);
    }
  }, [filteredFriends]);

  const activeTabHandler = (tab: string, action?: () => void): void => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      action?.();
    }
  };

  console.log(filteredFriends);
  console.log(filteredOnlineFriends);

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
                {receivedRequests.length > 0 && (
                  <div className={classes["friend-request-badge"]}>
                    <span className={classes["friend-request-count"]}>
                      {receivedRequests.length > 99
                        ? "99"
                        : receivedRequests.length}
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
                filteredOnlineFriends.map((filteredOnlineFriend) => (
                  <OnlineFriend
                    key={`online-${filteredOnlineFriend.id}`}
                    userId={userInfo?._id ?? ""}
                    id={filteredOnlineFriend.id}
                    nickname={filteredOnlineFriend.nickname}
                    avatarColor={filteredOnlineFriend.avatarColor}
                    onlineChecked={filteredOnlineFriend.onlineChecked}
                  />
                ))}
            </ul>

            <ul className={classes.friends}>
              {activeTab === "all" &&
                filteredFriends.map((filteredFriend) => (
                  <Friend
                    key={`friend-${filteredFriend.id}`}
                    userId={userInfo?._id ?? ""}
                    id={filteredFriend.id}
                    nickname={filteredFriend.nickname}
                    avatarColor={filteredFriend.avatarColor}
                    onlineChecked={filteredFriend.onlineChecked}
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
                      {receivedRequests.length > 0 && (
                        <div className={classes["received-requests"]}>
                          <div className={classes["received-text-wrapper"]}>
                            <span className={classes["received-text"]}>
                              받음
                            </span>
                            <span className={classes.line}>ㅡ</span>
                            <span>{receivedRequests.length}</span>
                          </div>

                          <div className={classes.underline}></div>

                          {receivedRequests.map((receivedRequest) => (
                            <PendingFriends
                              key={`received-${receivedRequest.id}`}
                              friendRequestId={receivedRequest.id}
                              nickname={receivedRequest.nickname}
                              avatarColor={receivedRequest.avatarColor}
                              sendRequest={receivedRequest.sendRequest}
                            />
                          ))}
                        </div>
                      )}

                      {sentRequests.length > 0 && (
                        <div className={classes["sent-requests"]}>
                          <div className={classes["sent-text-wrapper"]}>
                            <span className={classes["sent-text"]}>보냄</span>
                            <span className={classes.line}>ㅡ</span>
                            <span>{sentRequests.length}</span>
                          </div>

                          <div className={classes.underline}></div>

                          {sentRequests.map((sentRequest) => (
                            <PendingFriends
                              key={`sent-${sentRequest.id}`}
                              friendRequestId={sentRequest.id}
                              nickname={sentRequest.nickname}
                              avatarColor={sentRequest.avatarColor}
                              sendRequest={sentRequest.sendRequest}
                            />
                          ))}
                        </div>
                      )}
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
