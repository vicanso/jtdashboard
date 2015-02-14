module.exports = {
  schema : {
    account : {
      type : String,
      required : true,
      unique : true
    },
    password : {
      type : String,
      required : true
    },
    name : {
      type : String,
      required : true,
      unique : true
    },
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