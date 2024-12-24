const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

// MongoDB 연결을 위한 URI
const mongodbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";

let database; // DB 인스턴스를 저장하기 위한 변수

// MongoDB에 연결하고 DB 인스턴스를 설정하는 함수
const connectToDatabase = async () => {
  const client = await MongoClient.connect(mongodbUri); // MongoDB에 연결
  database = client.db("float-chat"); // 특정 DB에 연결
};

// DB 인스턴스를 반환하는 함수
// DB 연결이 설정되지 않았을 경우 오류를 발생시킴
const getDb = () => {
  if (!database) {
    throw { message: "데이터베이스 연결이 설정되지 않았습니다" };
  }
  return database;
};

module.exports = {
  connectToDatabase, // 데이터베이스 연결 함수 내보내기
  getDb, // 데이터베이스 인스턴스 반환 함수 내보내기
};
