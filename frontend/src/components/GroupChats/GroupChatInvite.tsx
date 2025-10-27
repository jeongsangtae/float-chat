import { GroupChatInviteProps } from "../../types";

import useGroupChatStore from "../../store/groupChatStore";

import classes from "./GroupChatInvite.module.css";

const GroupChatInvite = ({
  roomId,
  friendId,
  nickname,
  avatarColor,
  avatarImageUrl,
  onToggle,
}: GroupChatInviteProps) => {
  const { inviteGroupChat } = useGroupChatStore();

  const groupChatInviteHandler = async (): Promise<void> => {
    await inviteGroupChat({ roomId, friendId, nickname });
    onToggle();
  };

  return (
    <li className={classes["group-chat-invite-wrapper"]}>
      <div className={classes["group-chat-invite-info"]}>
        {avatarImageUrl ? (
          <img className={classes.avatar} src={avatarImageUrl} />
        ) : (
          <div
            className={classes.avatar}
            style={{ backgroundColor: avatarColor || "#ccc" }}
          >
            {nickname.charAt(0)}
          </div>
        )}

        <div className={classes["group-chat-invite-nickname"]}>{nickname}</div>
      </div>
      <div className={classes["group-chat-invite-button-wrapper"]}>
        <button
          className={classes["group-chat-invite-button"]}
          onClick={groupChatInviteHandler}
        >
          초대
        </button>
      </div>
    </li>
  );
};

export default GroupChatInvite;
