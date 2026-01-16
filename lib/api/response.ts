import { NextResponse } from 'next/server';
import {
  ApiUpstreamError,
  ApiAuthError,
  ApiAuthNotAllowed,
  ApiParameterError,
  ApiNotFoundError,
  ApiIntegrityError,
  ApiConflictError,
  ApiRateLimitError,
} from './error';
import { IS_PRODUCTION } from '@/lib/constant';

export async function response(data: unknown) {
  return NextResponse.json(data, { status: 200 });
}

export async function handleError(error: unknown) {
  if (IS_PRODUCTION) {
    console.log('API::handleError', error);
  }
  // Check subclass FIRST - ApiAuthNotAllowed extends ApiAuthError
  if (error instanceof ApiAuthNotAllowed) {
    return notAllowed(error);
  }
  if (error instanceof ApiAuthError) {
    return notAuthorized(error);
  }
  if (error instanceof ApiRateLimitError) {
    return rateLimited(error);
  }
  if (error instanceof ApiIntegrityError) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Server Error' +
          (IS_PRODUCTION ? '' : `, integrity error: ${error?.message}`),
        details: IS_PRODUCTION
          ? undefined
          : error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
  if (error instanceof ApiConflictError) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Application Error' +
          (IS_PRODUCTION ? '' : `, data conflict: ${error?.message}`),
        details: IS_PRODUCTION
          ? undefined
          : error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 409 },
    );
  }
  if (error instanceof ApiParameterError) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Application Error' +
          (IS_PRODUCTION ? '' : `, parameter error: ${error?.message}`),
        details: IS_PRODUCTION
          ? undefined
          : error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 400 },
    );
  }
  if (error instanceof ApiNotFoundError) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Application Error' +
          (IS_PRODUCTION ? '' : `, instance not found: ${error?.message}`),
        details: IS_PRODUCTION
          ? undefined
          : error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 404 },
    );
  }
  if (error instanceof ApiUpstreamError) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Service Error' +
          (IS_PRODUCTION ? '' : `, upstream failure: ${error?.message}`),
        details: IS_PRODUCTION
          ? undefined
          : error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 503 },
    );
  }
  let message = 'Unknown Error';
  if (error instanceof Error && 'message' in error) {
    message = error.message;
  }
  if (IS_PRODUCTION) {
    message = 'General Error';
  }
  return NextResponse.json(
    { success: false, error: 'ApplicationError: ' + message },
    { status: 500 },
  );
}
/**
 * not authorized: the resource accessed requires authorization but
 *                 the required header was not found
 */
export async function notAuthorized(cause?: Error) {
  return NextResponse.json(
    {
      success: false,
      error: 'Not authorized',
      details: IS_PRODUCTION ? undefined : cause?.message,
    },
    { status: 401 },
  );
}
/**
 * not authorized: the resource accessed is not accessible to the
 *                 authorization provided.
 */
export async function notAllowed(cause: Error) {
  return NextResponse.json(
    {
      success: false,
      error: 'No permission to access resource',
      details: IS_PRODUCTION ? undefined : cause?.message,
    },
    { status: 403 },
  );
}
/**
 * rate limited: the resource accessed is refusing the request to prevent abuse
 */
export async function rateLimited(cause: ApiRateLimitError) {
  return NextResponse.json(
    {
      success: false,
      error: 'Rate Limited',
      details: IS_PRODUCTION ? undefined : cause?.message,
    },
    {
      status: 429,
      headers: {
        ...(cause.limit && { 'X-RateLimit-Limit': cause.limit.toString() }),
        ...(cause.remaining && {
          'X-RateLimit-Remaining': cause.remaining.toString(),
        }),
        ...(cause.reset && {
          'X-RateLimit-Reset': cause.reset.toString(),
          'Retry-After': Math.ceil(
            (cause.reset - Date.now()) / 1000,
          ).toString(),
        }),
      },
    },
  );
}
