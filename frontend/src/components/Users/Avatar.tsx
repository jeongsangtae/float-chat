import classes from "./Avatar.module.css";

interface AvatarProps {
  nickname: string;
  avatarImageUrl?: string;
  avatarColor?: string;
  onlineChecked?: boolean;
  showOnlineDot?: boolean;
  extraClass?: string;
  // className2?: string;
}

const Avatar = ({
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  showOnlineDot,
  extraClass,
}: // className2,
AvatarProps) => {
  console.log(extraClass);

  return (
    <>
      {avatarImageUrl ? (
        showOnlineDot ? (
          <div className={classes["avatar-img-wrapper"]}>
            <img
              className={`${classes["avatar-img"]} ${
                classes[`${extraClass}`] ?? ""
              }`}
              // className={`${classes["avatar-img"]} ${className ?? ""}`}
              // className={`${classes["avatar-img"]} ${className2 ?? ""}`}
              src={avatarImageUrl}
            />
            {showOnlineDot && (
              <div
                className={
                  onlineChecked ? classes["online-dot"] : classes["offline-dot"]
                }
              />
            )}
          </div>
        ) : (
          <img
            className={`${classes["avatar-img"]} ${
              classes[`${extraClass}`] ?? ""
            }`}
            // className={`${classes["avatar-img"]} ${className ?? ""}`}
            // className={`${classes["avatar-img"]} ${className2 ?? ""}`}
            src={avatarImageUrl}
          />
        )
      ) : (
        <div
          className={`${classes["avatar-color"]} ${
            classes[`${extraClass}`] ?? ""
          }`}
          // className={`${classes["avatar-color"]} ${className ?? ""}`}
          // className={`${classes["avatar-color"]} ${className2 ?? ""}`}
          style={{ backgroundColor: avatarColor || "#ccc" }}
        >
          {nickname.charAt(0)}
          {showOnlineDot && (
            <div
              className={
                onlineChecked ? classes["online-dot"] : classes["offline-dot"]
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default Avatar;
