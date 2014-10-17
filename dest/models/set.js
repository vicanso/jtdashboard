(function() {
  module.exports = {
    name: 'stats_set',
    schema: {
      name: {
        type: String,
        require: true
      },
      configs: [
        {
          id: String,
          area: Number
        }
      ]
    }
  };

}).call(this);
