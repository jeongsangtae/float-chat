import { Link, useNavigate } from "react-router-dom";
import { DirectChatProps } from "../../types";
import { IoClose } from "react-icons/io5";

import useDirectChatStore from "../../store/directChatStore";
import useSocketStore from "../../store/socketStore";

import classes from "./DirectChat.module.css";

const DirectChat = ({
  _id,
  otherUserNickname,
  onlineChecked,
}: DirectChatProps) => {
  const navigate = useNavigate();

  const { getDirectChat, closeDirectChat } = useDirectChatStore();
  const { currentRoom } = useSocketStore();

  const closeDirectChatHandler = async (): Promise<void> => {
    await closeDirectChat(_id);
    await getDirectChat();

    if (currentRoom === _id) {
      navigate("/");
    }
  };

  return (
    <div
      className={`${classes["direct-chat-wrapper"]} ${
        currentRoom === _id ? classes.active : ""
      }`}
    >
      <Link to={`${_id}`} className={classes["direct-chat"]}>
        <div className={classes.avatar}>
          {otherUserNickname.charAt(0)}
          <div
            className={
              onlineChecked ? classes["online-dot"] : classes["offline-dot"]
            }
          />
        </div>
        <div className={classes["direct-chat-nickname"]}>
          <div>{otherUserNickname}</div>
        </div>
      </Link>
      <button
        className={classes["direct-chat-close"]}
        onClick={closeDirectChatHandler}
      >
        <IoClose className={classes["direct-chat-close-icon"]} />
      </button>
    </div>
  );
};

export default DirectChat;
