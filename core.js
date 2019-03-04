
// frame of the Promise
function Promise(fn){
    
    // 0 -- pending
    // 1 -- resolved
    // 2 -- rejected
    this._status = 0;

    // value contains the result of the Promise
    // such as value from resolve or reason from reject
    this._value = null;

    // the array for callback functions in then()
    this._deferreds = [];

    this.resolve = function(value){
        resolve(this,value);
    }
    this.reject = function(reason){
        reject(this,reason)
    }
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


// function of resolvem to set the statue of a promise into solved
// but according to the Promise/A+, it the value is a Promise
// Promise Resolution Procedure must be executed
function resolve(promise, value){

    // only status pending(0) can be solved
    if(promise._status !== 0){
        return;
    }
    // Throw error when the value and promise reference to the same Promise
    if(promise === value){
        reject(promise, new TypeError("You can not resolve a Promise itself!"))
    }

    // if value is an Object Promise, then the parameter promise should accept the value
    if(value && value instanceof Promise && value.then === promise.then){
        var defereds = promise._deferreds;

        // if the value is still pending, then push all the callbacks into the defereds
        // to suspend them
        if(value._status == 0){
            value._deferreds.push(...defereds);
        }
        // if the value is resolved or rejected
        else if(defereds.length !== 0){
            for (let i = 0; i < deferreds.length; i++) {
                handleResolved(value, deferreds[i]);
              }
              value._deferreds = [];
        }
        return;
    }

    // if value is Object or Function will be finished sooner or later

    // to get the promise solved
    promise._status = 1;
    promise._value = value;


    if (promise._deferreds.length !== 0) {
        for (let i = 0; i < promise._deferreds.length; i++) {
          handleResolved(promise, promise._deferreds[i]);
        }
        // clearing the callbacks of then
        promise._deferreds = [];
      }

}


// the function of reject a Promise
function reject(promise, reason){
    // promise can just be pending

    console.log(promise)
    if(promise._status !== 0){
        return;
    }

    // set the status into resolved
    promise._status = 2;
    promise._value =reason;

    if(promise._deferreds.length !== 0){
        for(let i = 0; i < promise._deferreds.length; i ++ ){
            handleResolved(promise, promise._deferreds[i]);
        }
        promise._deferreds = [];
    }
}


function handleResolved (promise, deferred) {
    // 异步执行注册回调
      var cb = promise._status === 1 ? 
              deferred.onFulfilled : deferred.onRejected;
  
      // 传递注册回调函数为空情况
      if (cb === null) {
        if (promise._status === 1) {
          resolve(deferred.promise, promise._value);
        } else {
          reject(deferred.promise, promise._value);
        }
        return;
      }
  
      // 执行注册回调操作
      try {
        var res = cb(promise._value);
      } catch (err) {
        reject(deferred.promise, err);
      }
  
      // 处理链式 then(..) 注册处理函数调用
      resolve(deferred.promise, res);
  }

module.exports = Promise