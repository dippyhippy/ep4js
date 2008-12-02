

/**
 * Browsers will pop up an error message if a script runs for too long.
 * This class helps break long running scripts into chunks, each run
 * separately after a given delay period.
 * 
 * http://kb.mozillazine.org/Dom.max_script_run_time says the default 
 * maximum run time for a script in FF is 10 seconds, so you'll want to
 * calibrate chunkSize and sleepTime to keep meanChunkRunTime_ time 
 * below that.
 *
 * TODO: add auto-calibration for chunkSize and sleepTime
 */
var AsyncWorker = function(worker, progress, chunkSize, sleepTime) {
	this.work_ = worker;
	this.progress_ = progress;
	this.chunkSize_ = chunkSize || 10;
	this.sleepTime_ = sleepTime || 1000;
	this.meanChunkRunTime_ = 0;
	this.totalChunkRunTime_ = 0;
};

AsyncWorker.prototype.runChunk_ = function() {
	if (!this.running_) { return; }
	var t0=0;
	for (var i=0; i<this.chunkSize_ && this.generation_ < this.generationsToRun_; i++) {
		t0 = new Date().getTime();
		this.work_();
		this.totalChunkRunTime_ += new Date().getTime() - t0;
		this.generation_++;
	}

	this.meanChunkRunTime_ = this.totalChunkRunTime_ / this.generation_;

	this.progress_(this.generation_, this.generationsToRun_);
		
	if (this.generation_ < this.generationsToRun_) {
		setTimeout(createBoundWrapper(this, this.runChunk_), this.sleepTime_);
	}	
};

AsyncWorker.prototype.start = function(generations) {
	this.generationsToRun_ = generations;
	this.generation_ = 0;
	this.progress_(this.generation_, this.generationsToRun_);
	this.running_ = true;		
	setTimeout(createBoundWrapper(this, this.runChunk_), this.sleepTime_);
};

AsyncWorker.prototype.stop = function() {
	this.running_ = false;
}

// http://www.alistapart.com/articles/getoutbindingsituations
function createBoundWrapper(object, method) {
  return function() {
    return method.apply(object, arguments);
  };
}