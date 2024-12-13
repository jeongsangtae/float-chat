// 클래스 타입
class User {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

  greet() {
    return `Hello, ${this.name}`;
  }
}

const user = new User(1, "Alice");
console.log(user.greet());

// 인라인 타입
const user: { id: number; name: string } = {
  id: 1,
  name: "Alice",
};

// 제네릭 타입
type Response<T> = {
  data: T;
  error: string | null;
};

const response: Response<string> = {
  data: "Success",
  error: null,
};

const numberResponse: Response<number> = {
  data: 42,
  error: null,
};

// 열거형 타입
enum Status {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
}

const userStatus: Status = Status.Active;

// 타입 단언
let someValue: unknown = "Hello, world!";
let strLength: number = (someValue as string).length;

// 인덱스 시그니처 타입
type Dictionary = {
  [key: string]: string;
};

const translations: Dictionary = {
  hello: "안녕",
  goodbye: "안녕히 가세요",
};

// 조건부 타입
type IsString<T> = T extends string ? "Yes" : "No";

type Test1 = IsString<string>; // "Yes"
type Test2 = IsString<number>; // "No"
