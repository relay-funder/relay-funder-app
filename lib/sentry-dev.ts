// this is the mock/development sentry object
// it avoids about 2k modules in next dev build and speeds
// up the hot-reloading significantly
// This file is not imported directly, but bind-mounted by the
// docker-compose.yml
const Sentry = {
  captureException: (error: unknown) => {
    console.log('mocked-sentry: captureException', error);
  },
  captureRouterTransitionStart: () => {
    console.log('mocked-sentry: captureRouterTransitionStart');
  },
  captureRequestError: (error: unknown) => {
    console.log('mocked-sentry: captureRequestError', error);
  },
  init: (options: unknown) => {
    console.log('mocked-sentry-init', options);
  },
};

export { Sentry };
