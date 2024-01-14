
/* This project is all about promises, and specifically how a promise object might be implemented 
by a browser in Javascript */

class MyPromise {
    constructor(asyncFunction) {
        // When I create a new promise, I am going to pass an async function. I am going to immediately call that function, 
        // passing it this instance's myPromiseResolveFunc and myPromiseRejectFunc.
        // it's up to the passed in asyncFunction to actually call the callbacks that are being provided here.
        this.#status = 'pending'
        try {
            asyncFunction(this.myPromiseResolveFunc, this.myPromiseRejectFunc)
        } catch (error) {
            this.#error = error
            this.catch()
        }
    }
    // creating private fields so a user can't just assign these outside this class definition.
    #status
    #error
    #onFulfilled
    #onRejected
    #resolvedValue
    #rejectedValue
    
    // his is called either by the passed in asyncFunction or the instance .then().\
    // There's a possiblity this will be called before a .then()
    // has assigned the onFulfilled func
    /**
     * 
     * @param {*} resolveValue 
     * @returns this Prom
     */
    myPromiseResolveFunc = (resolveValue) => {
        
        // We need to manage the state of the instance, because it is possible
        // that a .then() callback has been passed "after" the initial asyncFunction has already completed.
        // If that's the case, then within the .then(), we'll check if for resolved, then immediately call the provided callback
        this.#status = 'resolved' 
        this.#resolvedValue = resolveValue
        
        // check if a #onFulfilled has been provided .then() has been 
        if (this.#onFulfilled) {
            this.#onFulfilled(resolveValue)
        }
        return this
    }

    // this is called the passed asyncFunction. There's a possiblity this will be called before a .then()
    // has assigned the onRejected func
    myPromiseRejectFunc = (rejectedValue) => {
        this.#status = 'rejected' 
        // set these callbacks so they can be called from the asyncFunction when it completes
        this.#rejectedValue = rejectedValue

        if (this.#onRejected) {
            this.#onRejected(rejectedValue)
        }
        return this
    }

    then(onFulfilled, onRejected) {
        // set these callbacks so they can be called from the asyncFunction when it completes
        this.#onFulfilled = onFulfilled
        this.#onRejected = onRejected
        //IF the promise was immediately resolved, then we need to immediately invoke the provided onFulfilled callback,
        if (this.#status === 'resolved') {
            onFulfilled(this.#resolvedValue)
        }

        //same as above, immediatedly invoke the provided callback, with the state
        if (this.#status  === 'rejected') {
            onRejected(this.#rejectedValue)
        }

        return this
    }

    catch(onError) {
        if (onError) {
            onError(this.#error)
        }
    }
}

const promiseObj = new MyPromise((resolveFuncFromMyPromise, rejectFuncFromMyPromise) => {

    setTimeout(() => {
        const randomInt = Math.floor(Math.random() * 10)
        if (randomInt % 2 === 0 ) {
            resolveFuncFromMyPromise('foo');
        } else {
            rejectFuncFromMyPromise('request rejected')
        }
      }, 0);
})

promiseObj.then((value) => console.log('Value', value), (err) => console.log('Err', err))

