import NextAuth from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

import { authConfig } from './config';

const {
  auth: uncachedAuth,
  handlers: authHandlers,
  signIn,
  signOut,
} = NextAuth(authConfig);

const auth = cache(uncachedAuth);

function handleUiGET(req: NextRequest) {
  // const requestUrl = new URL(req.url);
  // if (requestUrl.pathname === '/api/auth/signin') {
  //   // redirect to home, there is no signin page
  //   return NextResponse.redirect('/');
  // }
  return authHandlers.GET(req);
}
const handlers = {
  POST: authHandlers.POST,
  GET: handleUiGET,
};
export { auth, handlers, signIn, signOut };
