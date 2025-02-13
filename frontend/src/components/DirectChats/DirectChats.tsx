import DirectChat from "./DirectChat";
import Friends from "../Friends/Friends";
import useAuthStore from "../../store/authStore";

const DirectChats = () => {
  const { isLoggedIn } = useAuthStore();
  return (
    <>
      {isLoggedIn && (
        <>
          <p>아이콘 들어갈 위치</p>
          <DirectChat />
          <Friends />
        </>
      )}
    </>
  );
};

export default DirectChats;
