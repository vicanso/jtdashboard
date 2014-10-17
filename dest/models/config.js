(function() {
  module.exports = {
    name: 'stats_config',
    schema: {
      name: {
        type: String,
        require: true
      },
      point: {
        interval: Number
      },
      type: String,
      desc: String,
      date: {
        start: String,
        end: String
      },
      stats: [
        {
          category: String,
          chart: String,
          keys: []
        }
      ]
    },
    indexes: [
      {
        name: 1
      }
    ]
  };

}).call(this);
