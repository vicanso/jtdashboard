module.exports = {
  schema : {
    account : {
      type : String,
      required : true
    },
    password : {
      type : String,
      required : true
    },
    name : String,
    createdAt : {
      type : String,
      required : true
    },
    lastLoginedAt : {
      type : String,
      required : true
    }
  },
  // 索引数组
  indexes : [
    {
      account : 1
    }
  ]
};