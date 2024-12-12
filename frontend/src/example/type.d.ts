// type으로 타입 정의
type User = {
  id: number;
  name: string;
  isAdmin: boolean;
};

const user: User = {
  id: 1,
  name: "John",
  isAdmin: true,
};

// 유니온 타입 정의
type StringOrNumber = string | number;

const value: StringOrNumber = 42; // number
const anotherValue: StringOrNumber = "Hello"; // string

// 유니온 타입 정의 내용 추가
type Status = "success" | "error" | "loading";

// 교차 타입 사용
type HasName = { name: string };
type HasAge = { age: number };

type Person = HasName & HasAge;

const person: Person = {
  name: "Alice",
  age: 30,
};

// 교차 타입 내용 추가
type Combined = { a: string } & { b: number };

// 튜플 타입 정의
type Tuple = [number, string, boolean];
const data: Tuple = [42, "Hello", true];

// 튜플 타입 내용 추가
type Tuple = [string, number];

// 함수 타입 정의
type Add = (a: number, b: number) => number;

const add: Add = (a, b) => a + b;

// 기본 타입 래핑
type ID = string | number;
const userId: ID = 123;
