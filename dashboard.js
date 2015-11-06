var blessed = require('blessed')
, contrib = require('blessed-contrib')
, request = require('request');

var screen = blessed.screen({
  smartCSR: true
});

//create layout and widgets

var grid = new contrib.grid({rows: 12, cols: 12, screen: screen})


var kontostandLine = grid.set(0, 0, 6, 6, contrib.line, 
  { showNthLabel: 5
    , maxY: 100
    , label: 'Kontostand'
    , showLegend: true
    , legend: {width: 10}})

var paybackLine = grid.set(0, 6, 3, 3, contrib.line, 
  { showNthLabel: 5
    , maxY: 100
    , label: 'Payback'
    , showLegend: true
    , legend: {width: 10}})



function getData () {
  getCosm(kontostandLine, 'Euro', 'http://api.xively.com/v2/feeds/42055/datastreams/Kontostand.json?start=2014-11-05T20%3A12%3A06.402Z&end=2015-11-05T20%3A12%3A06.403Z&interval=86400&limit=1000');
  getCosm(paybackLine, 'Payback Punkte', 'http://api.xively.com/v2/feeds/42055/datastreams/Payback_Punkte.json?start=2014-11-05T20%3A12%3A06.402Z&end=2015-11-05T20%3A12%3A06.403Z&interval=86400&limit=1000');
};

getData();

setInterval(function () {
  getData();
}, 60000)


function getCosm (line, title, url) {
  request.get({
    url: url,
    headers: {'X-Apikey': 'M3JtslLtgs9iBo1YWcnk6LEmMBHmMrCZhsGWtb0jXdSCFwJA'}
  }, function (err, res, body) {
    var data = JSON.parse(body).datapoints;
    var x = [];
    var y = [];

    for (var i = data.length - 1; i >= 0; i--) {
      x.push(data[i].at.match(/(\d{2}-\d{2})T/, 
        function (_, m1){
          return m1;
        })[1]
      );
      y.unshift(data[i].value);
    }

    var dataobj = {
      title: title,
      style: {line: 'red'},
      x: x,
      y: y
    }

    setData(dataobj, line);

  });
}

function setData(data, line) {
  line.setData(data);
  screen.render();
}

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render()
