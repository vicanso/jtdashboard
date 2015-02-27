'use strict';
module.exports = function(req, res, cbf){
  var data = req.body;
  console.log(JSON.stringify(data));
  var timing = data.timing;
  if(timing){
    var result = {
      loadEvent : timing.loadEventEnd - timing.loadEventStart,
      domContentLoadedEvent : timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      response : timing.responseEnd - timing.responseStart,
      firstByte : timing.responseStart - timing.requestStart,
      connect : timing.connectEnd - timing.connectStart,
      domainLookup : timing.domainLookupEnd - timing.domainLookupStart,
      fetch : timing.responseEnd - timing.fetchStart,
      request : timing.responseEnd - timing.requestStart,
      dom : timing.domComplete - timing.domLoading
    };
  }

  cbf(null, {
    msg : 'success'
  });
};