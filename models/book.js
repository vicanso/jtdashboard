module.exports = {
  schema : {
    id : Number,
    name : String,
    author : String
  },
  // 索引数组
  indexes : [
    {
      id : 1,
      name : 1
    },
    {
      id : 1,
      author : 1
    }
  ]
};

// module.exports =
//   schema :
//     id : Number
//     name : String
//     address : String
//     books : 
//       type : Array
//   indexes : [
//     {
//       id : 1
//       name : 1
//     }
//     {
//       id : 1
//       address : 1
//     }
//   ] 