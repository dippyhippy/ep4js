
/**
 * Programs in this example are Function objects.  
 * It uses a simple single-point crossover and single-point mutation operator.
 */

/**
 * Operations like single-point crossover work intuitively on linear arrays, but functions are trees.
 * So let's pick a traversal order, and choose a crossover point as step N of that traversal.  
 * Everything under that point's subtree is part of the crossover. 
 */
function functionCross(a, b) {
	// have to make deep copies so we don't alter the originals.
	a = a.program.deepCopy();
	b = b.program.deepCopy();
	
	// pick a random subtree to take from parent b:
	var c = Math.round(Math.random()*(b.nodeCount()-1));
	var transplant;
	b.depthFirst(function(node) { if (c-- == 0) transplant = node; });
	
	// pick a random insertion point from parent a:
	c = Math.round(Math.random()*(a.nodeCount()-1));
	var target;
	a.depthFirst(function(node) { if (c-- == 0) target = node; });

	//debug("before target: "+ target.op + " " + target.a + " " + target.b);
	
	if (ep4js.example.Function.BinaryOps[target.op]) {
		// randomly pick one side
		if (Math.random() > 0.5) {
			target.a = transplant;
		} else {
			target.b = transplant;
		}
	} else if (ep4js.example.Function.UnaryOps[target.op]) {
		target.a = transplant;
	} else if (ep4js.example.Function.Terminals[target.op]){
		// target.op = transplant.op;
	} else {
		// TODO: what to do with constants.
	}
		
	return {program:a, score:0};
}

function functionMutate(a) {
	a = a.program.deepCopy();
	// pick a random subtree to mutate
	var c = Math.round(Math.random()*(a.nodeCount()-1));
	var target;
	a.depthFirst(function(node) { if (c-- == 0) target = node; });
	var mutant = ep4js.example.Function.randomFunction(2);
	if (ep4js.example.Function.BinaryOps[target.op]) {
		// randomly pick one side
		if (Math.random() > 0.5) {
			target.a = mutant;
		} else {
			target.b = mutant;
		}
	} else if (ep4js.example.Function.UnaryOps[target.op]) {
		target.a = mutant;
	} else if (ep4js.example.Function.Terminals[target.op]){
	} else {
	}
	return {program:a, score:0};
}

function functionEvaluate(a) {
	// compare to the standard.
	
	var r2 = {};
	for (var x_val in GOLD_FN) {
		x = parseFloat(x_val); // so stupid
		r2[x_val] = a.program.eval(x);
	}
	return RMSD(GOLD_FN, r2);
}

function functionNewProgram() {
	return ep4js.example.Function.randomFunction(3);
}
