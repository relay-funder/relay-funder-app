// this is the mock/development sentry object
// it avoids about 2k modules in next dev build and speeds
// up the hot-reloading significantly
// This file is not imported directly, but bind-mounted by the
// docker-compose.yml
let Sentry = {
  setUser: (any) => {},
  captureException: (e) => 'mocked-in-development',
  captureRequestError: (any) => {},
  getFeedback: () =>
    undefined as
      | undefined
      | {
          attachTo: (any) => undefined;
        },
  addEventProcessor: (any) => any,
  init: (options: unknown) => {
    console.log('mocked-sentry-init', options);
  },
};

export { Sentry };
