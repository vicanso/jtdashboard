(function() {
  module.exports = {
    name: 'test',
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
