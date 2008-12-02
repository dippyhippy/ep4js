//TODO: clean this slop up.

var POP_SIZE = 100;
var MUTATION_RATE = 0.01;
var GENERATIONS = 100;
var MAXIMIZE = true;
var ep = new ep4js.EP();

function init(myCross, myMutate, myEvaluate, myNewProgram) {
	ep.cross = myCross;
	ep.mutate = myMutate;
	ep.evaluate = myEvaluate;
	ep.newProgram = myNewProgram;
	
	$('populationSize').value = POP_SIZE;
	$('mutationRate').value = MUTATION_RATE;
	$('generations').value = GENERATIONS;		
	$('maximize').value = MAXIMIZE;		
}

function myNewProgram() {
  return "";
}

function myCross(a, b) {
  return a;
}

function myMutate(a) {
  return a;
}

function myEvaluate() {
  return 0;
}

function showPop(ep) {	  
	for (var i=0; i<ep.population.length; i++) {
		ep.population[i].score = ep.evaluate(ep.population[i]);
	}
	
	ep.population = ep.sortPopulation();
	
	$("topIndividuals").innerHTML = "";
	
	for (var i=0; i<10; i++) {
		var a = ep.population[i];
		var line = document.createElement("DIV");
		line.program = a;
		line.innerHTML = a.program + ": " + a.score;
		line.onclick = function() {showLineDetail(a)};
		$("topIndividuals").appendChild(line);
	}
	
	showLineDetail(ep.population[0]);
	
	showChart();
}

function showChart() {
	// TODO: replace this with google visualization api.
	var chartUrl = ep.googleChartUrl();
	
	$("chart").innerHTML = "<img src='" + chartUrl + "'/>";
}

function showLineDetail(line) {
  var div = $('individualDetail');
  
  div.innerHTML = line.program;
}

// jquery?  bwaahahahaha
function $(id) {
	return document.getElementById(id);
}

var worker;
var CHUNK_SIZE = 10;
var SLEEP_TIME = 100;

function run() {
  ep.init($('populationSize').value, $('maximize').checked);
  ep.mutationRate = $('mutationRate').value;
  ep.progress = progress;
  $('runButton').style.display = 'none';
  $('stopButton').style.display = 'block';
  
  worker = new AsyncWorker(createBoundWrapper(ep, ep.generate), progress, CHUNK_SIZE, SLEEP_TIME);
  worker.start($('generations').value);
}

function progress(current, total) {
  var progressBar = $('progressBar');
  progressBar.style.display="block";
  progressBar.firstChild.innerHTML = current + "/" + total;
  progressBar.firstChild.style.width= (100*current/total) + "%"
  if (current == total) {
    // done;
    progressBar.style.display="none";
    $('runButton').style.display = '';
    $('stopButton').style.display = 'none';
  }
  showPop(ep);
}

function stop() {
  if (worker) {
    worker.stop();
  }
  $('stopButton').style.display = 'none';
  $('runButton').style.display = 'block';
  $('progressBar').style.display = 'none';
}