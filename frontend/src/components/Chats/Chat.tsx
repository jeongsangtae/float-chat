import { ChatMessage } from "../../types";

import classes from "./Chat.module.css";

const Chat = ({
  nickname,
  message,
  date,
}: Pick<ChatMessage, "nickname" | "message" | "date">) => {
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

  // 현재 날짜 정보 가져오는 내용
  const now = new Date(); // 현재 시간 기준의 Date 객체 생성

  // 채팅 메시지의 날짜를 기반으로 Date 객체 생성
  // 월은 0부터 시작하므로, -1 (ex: 4월 -> 3)
  const msgDate = new Date(parseInt(year), numMonth - 1, numDay);

  // 오늘 날짜의 00:00:00 기준 Date 객체 생성
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 어제 날짜의 00:00:00 기준 Date 객체 생성
  // today 객체를 복사해서 날짜만 하루 전으로 수정
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // 날짜 조건 체크
  // 메시지 날짜가 오늘 또는 어제인지 확인
  const todayChecked = msgDate.getTime() === today.getTime();
  const yesterdayChecked = msgDate.getTime() === yesterday.getTime();

  // 날짜 포맷 결과를 담는 변수
  let resultDate = "";

  // 조건에 따라 날짜 출력 형식 변경
  if (todayChecked) {
    // 오늘이면 년, 월, 일 생략하고 시간만 표기
    resultDate = `${ampm} ${resultHour}:${minute}`;
  } else if (yesterdayChecked) {
    // 어제면 "어제"라는 표시를 앞에 붙여서 표기
    resultDate = `어제 ${ampm} ${resultHour}:${minute}`;
  } else {
    // 그 외의 날짜는 전체 날짜를 표기
    resultDate = `${shortYear}. ${numMonth}. ${numDay}. ${ampm} ${resultHour}:${minute}`;
  }

  return (
    <div className={classes["chat-container"]}>
      <div className={classes["chat-header"]}>
        <span className={classes["chat-nickname"]}>{nickname}</span>
        <span className={classes["chat-date"]}>{resultDate}</span>
      </div>
      <div className={classes["chat-message"]}>{message}</div>
    </div>
  );
};

export default Chat;
