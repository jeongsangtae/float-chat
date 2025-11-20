import { Link, useNavigate, useLocation } from "react-router-dom";
import { IoClose } from "react-icons/io5";

import useDirectChatStore from "../../store/directChatStore";
import useSocketStore from "../../store/socketStore";

import { DirectChatProps } from "../../types";
import classes from "./DirectChat.module.css";
import Avatar from "../Users/Avatar";

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
        <Avatar
          nickname={otherUserNickname}
          avatarImageUrl={otherUserAvatarImageUrl}
          avatarColor={otherUserAvatarColor}
          onlineChecked={onlineChecked}
          showOnlineDot={true}
        />

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
