import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";

import useDirectChatStore from "../../store/directChatStore";
import useSocketStore from "../../store/socketStore";

import { DirectChatProps } from "../../types";
import classes from "./DirectChat.module.css";

const DirectChat = ({
  _id,
  otherUserNickname,
  otherUserAvatarColor,
  otherUserAvatarImageUrl,
  onlineChecked,
}: DirectChatProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname === `/me/${_id}`;

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
        active ? classes.active : ""
      }`}
    >
      <Link to={`${_id}`} className={classes["direct-chat"]}>
        {otherUserAvatarImageUrl ? (
          <div className={classes["avatar-img-wrapper"]}>
            <img
              className={classes["avatar-img"]}
              src={otherUserAvatarImageUrl}
            />
            <div
              className={
                onlineChecked ? classes["online-dot"] : classes["offline-dot"]
              }
            />
          </div>
        ) : (
          <div
            className={classes["avatar-color"]}
            style={{ backgroundColor: otherUserAvatarColor }}
          >
            {otherUserNickname.charAt(0)}
            <div
              className={
                onlineChecked ? classes["online-dot"] : classes["offline-dot"]
              }
            />
          </div>
        )}

        <div className={classes["direct-chat-nickname"]}>
          {otherUserNickname}
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
