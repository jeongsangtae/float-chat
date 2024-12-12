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

// 교차 타입 사용
type HasName = { name: string };
type HasAge = { age: number };

type Person = HasName & HasAge;

const person: Person = {
  name: "Alice",
  age: 30,
};

// 튜플 타입 정의
type Tuple = [number, string, boolean];
const data: Tuple = [42, "Hello", true];
