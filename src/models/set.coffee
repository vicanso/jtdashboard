module.exports =
  name : 'stats_set'
  schema :
    creator : 
      type : String
      require : true
    name : 
      type : String
      require : true
    configs : [
      {
        id : String
        width : Number
      }
    ]
