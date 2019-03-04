
// frame of the Promise
function Promise(fn){

    var self = this;
    
    // 0 -- pending
    // 1 -- resolved
    // 2 -- rejected
    self._status = 0;

    // value contains the result of the Promise
    // such as value from resolve or reason from reject
    self._value = null;

    // the array for callback functions in then()
    self._deferreds = [];

    // The Promise runs like new Promise(function(resolve, reject){...})
    // resolve is like resolve(promise, value), so here use an anoynomous function to perform the function
    // reject is like reject(promise, reason), so here is the reason as the parameter
    try{
        fn(value=>{
                resolve(this, value)
            },
            reason=>{
                reject(this, reason)
            }
        )
    }catch(err){
        reject(this, err)
    }

}

// the definition of then
Promise.prototype.then = function(onFulfilled, onRejected){

    // define the res as the value to return
    // since the return value of then is supposed to be another Promise
    // to ensure the chain-style calling like xx.then(...).then(...)
    var res = new Promise(function(){});

    // new a Handler with onFulfilled and onRejected
    var deferred = new Handler(onFulfilled, onRejected, res);

    // if the status is pending, enqueue the promise including onFufilled and on Rejected
    if(this._status == 0){
        this._deferreds.push(deferred);
    }

    //if the status is not pending
    // use handleResolved to execute the callback functions
    handleResolved(this, deferred);

    // return a Promise to maintain the chain of then()
    return res;

}

// function to handle the onFulfilled and on Rejected callbacks
// since the default parameters can be omitted
function Handler(onFulfilled, onRejected, res){
    res.onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : null;
    res.onRejected = typeof onRejected == 'function' ? onFulfilled : null;
    return res; 
}

