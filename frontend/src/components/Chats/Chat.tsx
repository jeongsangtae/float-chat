import { ChatMessage } from "../../types";

import classes from "./Chat.module.css";

const Chat = ({ message, date }: Pick<ChatMessage, "message" | "date">) => {
  // 공백 기준으로 날짜와 시간을 분리
  const [dateOnly, timeOnly] = date.split(" ");

  // 날짜 부분을 "." 기준으로 분리
  const [year, month, day] = dateOnly.split(".");

  // 시간 부분을 ":" 기준으로 분리
  const [hour, minute] = timeOnly.split(":");

  // 년도의 뒷 2자리만 사용
  const shortYear = year.slice(2);

  // 문자열로 되어 있는 월, 일, 시를 숫자로 변환 (ex: 04 -> 4)
  // 10진수 숫자로 변환
  const numMonth = parseInt(month, 10);
  const numDay = parseInt(day, 10);
  const numHour = parseInt(hour, 10);

  // 오전인지 확인 (12시 이전이면 오전)
  const am = numHour < 12;

  // 오전일 때 0시는 12로 표기, 나머지는 그대로 표기
  // 오후일 때 13~23시는 12를 뺴고, 12시는 그대로 12시로 표기
  const resultHour = am
    ? numHour === 0
      ? 12
      : numHour
    : numHour > 12
    ? numHour - 12
    : 12;

  // 오전/오후 표기
  const ampm = am ? "오전" : "오후";

  // 최종 날짜 문자열 조합
  const resultDate = `${shortYear}. ${numMonth}. ${numDay}. ${ampm} ${resultHour}:${minute}`;

  return (
    <div className={classes["chat-container"]}>
      <p className={classes["chat-message"]}>{message}</p>
      <p>{resultDate}</p>
    </div>
  );
};

export default Chat;
