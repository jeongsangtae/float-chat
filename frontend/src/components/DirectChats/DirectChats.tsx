import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";
import useSocketStore from "../../store/socketStore";
import useGroupChatStore from "../../store/groupChatStore";
import { useEffect } from "react";

const DirectChats = () => {
  const { isLoggedIn } = useAuthStore();
  const { getGroupChatInvites, groupChatInvites } = useGroupChatStore();
  const { notification } = useSocketStore();

  const notificationMessage = {
    friendRequest: (data) => `${data.requester} 님이 친구 요청을 보냈습니다.`,
    messageNotification: (data) => `${data.roomTitle}에서 새로운 메시지 추가`,
    groupChatInviteNotification: (data) =>
      `${data.roomTitle} 그룹 채팅에 초대했습니다.`,
  };

  console.log(groupChatInvites);

  // const getGroupChatInvites = () => {
  //   getGroupChatInvites()
  // }

  useEffect(() => {
    getGroupChatInvites();
  }, []);

  return (
    <>
      {isLoggedIn && (
        <>
          <p>아이콘 들어갈 위치</p>
          <DirectChat />
          {groupChatInvites.map((groupChatInvite) => (
            <ul key={groupChatInvite._id}>
              <li>{groupChatInvite.requesterNickname}</li>
              <button>수락</button>
              <button>거절</button>
            </ul>
          ))}
          {notification.map((notif, index) => (
            // <div key={index}>
            //   {notif.type === "friendRequest" ? (
            //     <p>{notif.data.requester} 님이 친구 요청을 보냈습니다.</p>
            //   ) : (
            //     <p>{notif.data.roomTitle}에서 새로운 메시지 추가</p>
            //   )}
            // </div>
            <div key={index}>
              <p>
                {notificationMessage[notif.type]?.(notif.data) ||
                  "알 수 없는 알림"}
              </p>
            </div>
          ))}
          <Friends />
        </>
      )}
    </>
  );
};

export default DirectChats;
