import classes from "./Avatar.module.css";

interface AvatarProps {
  nickname: string;
  avatarImageUrl?: string;
  avatarColor?: string;
  onlineChecked?: boolean;
  showOnlineDot?: boolean;
  className?: string;
  className2?: string;
}

const Avatar = ({
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  showOnlineDot,
  className,
  className2,
}: AvatarProps) => {
  console.log(className, className2);

  return (
    <>
      {avatarImageUrl ? (
        showOnlineDot ? (
          <div className={classes["avatar-img-wrapper"]}>
            <img
              className={`${classes["avatar-img"]} ${
                classes[`${className}`] ?? ""
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
              classes[`${className}`] ?? ""
            }`}
            // className={`${classes["avatar-img"]} ${className ?? ""}`}
            // className={`${classes["avatar-img"]} ${className2 ?? ""}`}
            src={avatarImageUrl}
          />
        )
      ) : (
        <div
          className={`${classes["avatar-color"]} ${
            classes[`${className}`] ?? ""
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
