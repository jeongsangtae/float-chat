// interface로 객체 타입 정의
interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}

const user: User = {
  id: 1,
  name: "John",
  isAdmin: true,
};

// interface 선언 병합
interface User {
  id: number;
  name: string;
}

interface User {
  isAdmin: boolean;
}

const user: User = {
  id: 1,
  name: "John",
  isAdmin: true,
};

// interface 계층적 구조 설계 (extends)
interface Person {
  name: string;
}

interface Employee extends Person {
  salary: number;
}

const employee: Employee = {
  name: "Alice",
  salary: 50000,
};
