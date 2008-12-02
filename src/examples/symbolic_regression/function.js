var ep4js = ep4js || {};
ep4js.example = ep4js.example || {};


/**
 * A Function class for use in ep4js's symbolic regression example.
 * Simple way to use this: new ep4js.example.Function("+", 3, 2).eval() == 5;
 * Requirements for a and b parameters depend on whether op is BinaryOp, UnaryOp or Terminal.
 */
ep4js.example.Function = function(op, a, b) { 
	this.op = op;
	this.a = a;
	this.b = b; 
};

ep4js.example.Function.MAX_RANDOM = 10;

ep4js.example.Function.prototype.toString = function() {
	return this.op;
};

/**
 * Evaluates the function for x, creating the function from serialized javascript if necessary.
 */
ep4js.example.Function.prototype.eval = function(x) {
	//var str = this.serialize();
	if (!this.evalFunc)
		eval("this.evalFunc = function(x) {return " + this.serialize() + ";};");
	var ret = this.evalFunc(x);
	if (isNaN(ret))	{ return 0; }
	return ret;
};

/**
 * Generates a Javascript string representation of the function, suitable for eval()ing a la JSON.
 */
ep4js.example.Function.prototype.serialize = function() {
	if (ep4js.example.Function.BinaryOps[this.op]) {
		if (this.op.indexOf('Math.')==0) {
			return this.op + "(" + this.constOrSerialize_(this.a) + "," + this.constOrSerialize_(this.b) + ")";
		}
		return "(" + this.constOrSerialize_(this.a) + " " + this.op + " " + this.constOrSerialize_(this.b) + ")";
	} else if (ep4js.example.Function.UnaryOps[this.op]) {
		return this.op + "(" + this.constOrSerialize_(this.a) + ")";
	} else if (ep4js.example.Function.Terminals[this.op]) {
		return this.op;
	} else {
		throw new Object("unknown op:" + this.op + ": " + this);
	}	
};

/**
 * Returns a deep copy of this Function
 */
ep4js.example.Function.prototype.deepCopy = function() {
	if (ep4js.example.Function.BinaryOps[this.op]) {
		return new ep4js.example.Function(this.op, this.constOrCopy_(this.a), this.constOrCopy_(this.b));
	} else if (ep4js.example.Function.UnaryOps[this.op]) {
		return new ep4js.example.Function(this.op, this.constOrCopy_(this.a));
	} else if (ep4js.example.Function.Terminals[this.op]) {
		return new ep4js.example.Function(this.op);
	} else {
		throw new Exception("unknown op:" + this.op + ": " + this);
	}		
};

/**
 * Iterate over this function tree depth first, calling fn(node) for each node.
 */
ep4js.example.Function.prototype.depthFirst = function(fn) {
	if (ep4js.example.Function.BinaryOps[this.op]) {
		this.constOrDepthFirst_(this.a, fn);
		this.constOrDepthFirst_(this.b, fn);
	} else if (ep4js.example.Function.UnaryOps[this.op]) {
		this.constOrDepthFirst_(this.a, fn);
	} else if (ep4js.example.Function.Terminals[this.op]) {
	} else {
		throw new Exception("unknown op:" + this.op + ": " + this);
	}	
	fn(this);
};

ep4js.example.Function.prototype.nodeCount = function() {
	var count = 0;
	this.depthFirst(function(node) {count++;});
	return count;
};

ep4js.example.Function.BinaryOps = {
	"+" : function(a, b) {return a + b},
	"-" : function(a, b) {return a - b},
	"*" : function(a, b) {return a * b},
	"/" : function(a, b) {return a / b},
	"Math.max" : function(a, b) {return Math.max(a, b)},
	"Math.min" : function(a, b) {return Math.min(a, b)},
	"Math.pow" : function(a, b) {return Math.pow(a, b)}
};

ep4js.example.Function.UnaryOps = {
	"Math.sin" : function(x) { return Math.sin(x) },
	"Math.cos" : function(x) { return Math.cos(x) },
	"Math.tan" : function(x) { return Math.tan(x) },
	"Math.log" : function(x) { return Math.log(x) }
};

ep4js.example.Function.Terminals = {
	'x' : function() {return x;}
};

ep4js.example.Function.prototype.constOrSerialize_ = function(a) {
	if (a['serialize']) {
		return a.serialize();
	}
	return a;
};

ep4js.example.Function.prototype.constOrCopy_ = function(f) {
	if (f.deepCopy) { return f.deepCopy(); }
	return f;
}

ep4js.example.Function.prototype.constOrDepthFirst_ = function(f, fn) {
	if (f.depthFirst) {
		f.depthFirst(fn);
	} else {
		fn(f);
	}
};

/**
 * Generate a random function tree of maximum depth maxDepth.
 */
ep4js.example.Function.randomFunction = function(maxDepth) {
	if (maxDepth == 0) {
		if (Math.random() < 0.5) {
			return ep4js.example.Function.MAX_RANDOM/2 - 
				Math.random()*ep4js.example.Function.MAX_RANDOM;
		} else {
			return new ep4js.example.Function('x');
		}
	}
	var op = ep4js.example.Function.randomOp_();
	var a = ep4js.example.Function.randomFunction(maxDepth-1);
	var b = ep4js.example.Function.randomFunction(maxDepth-1);
	return new ep4js.example.Function(op, a, b);
};

/**
 * Generate a random OP, all are equally probable.  Used by randomFunction(maxDepth).
 */
ep4js.example.Function.randomOp_ = function() {
	// total up all the numbers of ops
	var totalOps = 0;
	for(op in ep4js.example.Function.BinaryOps) {
		totalOps++;
	}
	for(op in ep4js.example.Function.UnaryOps) {
		totalOps++;
	}
	for(op in ep4js.example.Function.Terminals) {
		totalOps++;
	}
	
	var opN = Math.round(Math.random()*(totalOps-1));
	for(op in ep4js.example.Function.BinaryOps) {
		if (--opN <= 0) return op;
	}
	for(op in ep4js.example.Function.UnaryOps) {
		if (--opN <= 0) return op;
	}
	for(op in ep4js.example.Function.Terminals) {
		if (--opN <= 0) return op;
	}
	throw new Object("ran out of ops trying to pick a random one: " + opN);
};


/**
 * Root Mean Square Deviation
 */
function RMSD(a, b) {
	var sum = 0;
	var n = 0;
	for (x in a) {
		var t = (a[x] - b[x]);
		if (!isNaN(t)) {
			n++;
			sum += t*t;
		}
	}
	return Math.sqrt(sum/n);
}


function debug(msg) {
}