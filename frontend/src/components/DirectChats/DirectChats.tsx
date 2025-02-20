import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";
import useSocketStore from "../../store/socketStore";

const DirectChats = () => {
  const { isLoggedIn } = useAuthStore();
  const { notification } = useSocketStore();

  return (
    <>
      {isLoggedIn && (
        <>
          <p>아이콘 들어갈 위치</p>
          <DirectChat />
          {notification.map((notif, index) => (
            <div key={index}>
              {notif.type === "friendRequest" && (
                <p>{notif.data.requester} 님이 친구 요청을 보냈습니다.</p>
              )}
            </div>
          ))}
          <Friends />
        </>
      )}
    </>
  );
};

export default DirectChats;
