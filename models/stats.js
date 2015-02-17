module.exports = {
  schema : {
    creator : {
      type : String,
      required : true
    },
    name : {
      type : String,
      required : true
    },
    type : {
      type : String,
      required : true
    },
    category : {
      type : String,
      required : true
    },
    key : Array,
    date : {
      type : Array,
      required : true
    },
    interval : {
      type : Number,
      required : true
    },
    createdAt : {
      type : String,
      required : true
    }
  },
  // 索引数组
  indexes : [
    {
      creator : 1
    },
    {
      category : 1
    }
  ]
};