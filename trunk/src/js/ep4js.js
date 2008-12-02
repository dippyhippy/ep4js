/**
 * Evolutionary Programming framework for JavaScript.
 * requires distribution.js (TODO: to refactor this)
 */
var ep4js = {};

ep4js.EP = function(){};

ep4js.EP.prototype.init = function(initialPopulationSize, maximize) {
	//not sure what should go here
	// mutation operator?
	// crossover operator?
	// compare function?
	this.population = new Array();
	this.mutationRate = 0.1; // a little high, I know

	this.mins = new Array(); // min score per generation
	this.maxs = new Array(); // max score per generation
	this.avgs = new Array(); // avg score per generation
	
	this.allTimeMax = 0;
	this.generation = 0;
	
	for (var i=0; i<initialPopulationSize; i++) {
		this.population[i] = new Object({program:this.newProgram(), score:0})
	}
	
	this.sort = maximize ? this.sortByScoreDesc_ : this.sortByScoreAsc_;
	
	this.eliteCount = 1; // only keep the best individual by default.
};

ep4js.EP.prototype.sortPopulation = function() {
	this.population = this.population.sort(this.sort);
	return this.population;
}

ep4js.EP.prototype.generate = function() {	
	// score all the individuals
	// sort by score
	// for each individual in the new population,
	//   pick its parents based on the current individual
	//   and a randomly chosen other, weighted by score	over a normal distribution			
	
	var min = null, max = null, avg = 0;
	
	// score the current population

	for (var i=0; i<this.population.length; i++) {
		var a = this.population[i];
		a.score = this.evaluate(a);
		if (!isNaN(a.score)) {
			if (!min || a.score < min) min = a.score;
			if (!max || a.score > max) max = a.score;
			avg += a.score;
		}
	}
	avg = avg/this.population.length;
	this.mins.push(min);
	this.maxs.push(max);
	this.avgs.push(avg);
	if (max > this.allTimeMax) {
		this.allTimeMax = max;
	}
	
	// sort them based on score
	this.population = this.sortPopulation();
				
	// generate the new population
	var newPop = new Array(this.population.length);
	for (var i=0; i<this.population.length; i++) {
		if (i<this.eliteCount) {
			newPop[i] = this.population[i];
		} else {
			// every individual's mate is drawn randomly from the population
			// based on a normal distribution of score.
			var j = this.population.sampleIndex();
			//move the sample over so the first elements are the highest prob.
			j = Math.abs(Math.round(this.population.length/2 - j)); 
			// yes, asexual reproduction is possible if i == j :)
			newPop[i] = this.cross(this.population[i], this.population[j]);
			if (Math.random() < this.mutationRate) {
				newPop[i] = this.mutate(this.population[i]);
			}
		}
	}
	
	this.population = newPop;
	this.generation++;
};

ep4js.EP.prototype.compare = function(a, b) {
	//return the better individual, a or b
	//useful for *relative* fittness, like when an absolute optimal solution 
	//value is not known.  for this, you need to have some kind of tournament to
	//rank the individuals
	// TODO: something more sophistitated than this comparison
	return a.score > b.score ? a : b;
};

ep4js.EP.prototype.evaluate = function(a) {
	//return a numberical score for the performance of the individual.
	//useful for *absolute* fittness, like when an absolute optimal solution
	//value is known.
	throw "You didn't specify .evaluate";
};

ep4js.EP.prototype.mutate = function(a) {
	//return a mutated version of a
	throw "You didn't specify .mutate";
};

ep4js.EP.prototype.cross = function(a, b) {
	//return a crossed-over offspring of a and b
	throw "You didn't specify .cross";
};

ep4js.EP.prototype.newProgram = function() {
	// return a new random program
	throw "You didn't specify .newProgram"
};

// some utitlity functions

// normal Array.sort doesn't work the way we want it to
ep4js.EP.prototype.sortByScoreDesc_ = function(a, b) {
	return b.score - a.score;
};

ep4js.EP.prototype.sortByScoreAsc_ = function(a, b) {
	return a.score - b.score;
};



