import { useState, useEffect } from "react";
import classes from "./Avatar.module.css";

interface AvatarProps {
  nickname: string;
  avatarImageUrl?: string;
  avatarColor?: string;
  onlineChecked?: boolean;
  showOnlineDot?: boolean;
  extraClass?: string;
  dotClass?: string;
}

const Avatar = ({
  nickname,
  avatarImageUrl,
  avatarColor,
  onlineChecked,
  showOnlineDot,
  extraClass,
  dotClass,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarImageUrl]);

  return (
    <>
      {avatarImageUrl && !imageError ? (
        showOnlineDot ? (
          <div className={classes["avatar-img-wrapper"]}>
            <img
              className={`${classes["avatar-img"]} ${
                classes[`${extraClass}`] ?? ""
              }`}
              onError={() => setImageError(true)}
              src={avatarImageUrl}
            />
            {showOnlineDot && (
              <div
                className={
                  onlineChecked
                    ? `${classes["online-dot"]} ${classes[`${dotClass}`]}`
                    : `${classes["offline-dot"]} ${classes[`${dotClass}`]}`
                }
              />
            )}
          </div>
        ) : (
          <img
            className={`${classes["avatar-img"]} ${
              classes[`${extraClass}`] ?? ""
            }`}
            onError={() => setImageError(true)}
            src={avatarImageUrl}
          />
        )
      ) : (
        <div
          className={`${classes["avatar-color"]} ${
            classes[`${extraClass}`] ?? ""
          }`}
          style={{ backgroundColor: avatarColor || "#ccc" }}
        >
          {nickname.charAt(0)}
          {showOnlineDot && (
            <div
              className={
                onlineChecked
                  ? `${classes["online-dot"]} ${classes[`${dotClass}`]}`
                  : `${classes["offline-dot"]} ${classes[`${dotClass}`]}`
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default Avatar;
