var Benchmark = require('benchmark')
  , lodash = require('lodash')

function getHz(bench) {
  var result = 1 / (bench.stats.mean + bench.stats.moe);
  return isFinite(result) ? result : 0;
}

function getGeometricMean(array) {
  return Math.pow(Math.E, lodash.reduce(array, function(sum, x) {
    return sum + Math.log(x);
  }, 0) / array.length) || 0;
}


module.exports = {
  onSuiteComplete: onSuiteComplete
}

//thanks lodash https://github.com/lodash/lodash/blob/master/perf/perf.js
function onSuiteComplete(suites, current, old){
  var score = { 'a': [], 'b': [] }

  return function(){

    for (var index = 0, length = this.length; index < length; index++) {
      var bench = this[index];
      if (bench.error) {
        console.log(bench.error)
        var errored = true;
      }
        
    }

    if (errored) 
      console.log('There was a problem, skipping...');
    
    else {
      var formatNumber = Benchmark.formatNumber,
          fastest = this.filter('fastest'),
          fastestHz = getHz(fastest[0]),
          slowest = this.filter('slowest'),
          slowestHz = getHz(slowest[0]),
          aHz = getHz(this[0]),
          bHz = getHz(this[1]);

      if (fastest.length > 1) {
        console.log('It\'s too close to call.');
        aHz = bHz = slowestHz;
      }
      else {
        var percent = ((fastestHz / slowestHz) - 1) * 100;

        
        console.log('\t' + slowest[0].name + ': ' + Benchmark.formatNumber(Math.round(slowestHz)) + ' per/s')
        console.log('\t' + fastest[0].name + ': ' + Benchmark.formatNumber(Math.round(fastestHz)) + ' per/s')
        console.log('\t--------------------------')
        console.log('\t' + 
          fastest[0].name + ' is ' +
          Benchmark.formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) +
          '% faster.'
        );
      }
      // add score adjusted for margin of error
      score.a.push(aHz);
      score.b.push(bHz);
    }
    // remove current suite from queue
    suites.shift();

    if (suites.length) 
      suites[0].run({ 'async': true});
    
    else {
      var aMeanHz = getGeometricMean(score.a),
          bMeanHz = getGeometricMean(score.b),
          fastestMeanHz = Math.max(aMeanHz, bMeanHz),
          slowestMeanHz = Math.min(aMeanHz, bMeanHz),
          xFaster = fastestMeanHz / slowestMeanHz,
          percentFaster = Benchmark.formatNumber(Math.round((xFaster - 1) * 100)),
          message = 'is ' + percentFaster + '% ' + (xFaster == 1 ? '' : '(' + Benchmark.formatNumber(xFaster.toFixed(2)) + 'x) ') + 'faster than';

      // report results
      if (aMeanHz >= bMeanHz)
        console.log('\n' + current + ' ' + message + ' ' + old + '.');
      else 
        console.log('\n' + old + ' ' + message + ' ' + current + '.');
    }
  }
}
  