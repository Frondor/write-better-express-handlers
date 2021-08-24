## Good and bad examples of writing async code inside Express handlers

This repository hosts a demonstration of the good and bad practices we spoke about handling errors inside express' middleware functions.

You can read more at [How to (not) handle async errors in Node; based on a true story](#).

## Try it locally

1. Clone the repo
2. Run `npm install && npm start`
3. Open the given URL in your browser and point to the `/bad` and `/good` routes

## Check the tests

Both examples has a test case to reproduce each case.

Run the with `npm test`

- [Bad example](example-bad.js) ([test](example-bad.test.js))
- [Good example](example-good.js) ([test](example-good.test.js))

## Final thoughts

These examples can get better, of course, we could have some abstractions at the service layer instead of calling `axios` directly, custom error classes and a better error handler, but for the sake of keeping things simple I'd prefer to focus on the proper use of `try/catch` and leave those for another occasion.
