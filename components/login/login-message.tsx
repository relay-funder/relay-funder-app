'use client';

import React from 'react';

import { AlertCircle, Loader2, CheckCircle2, Wallet } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define the LoginState enum here so it can be imported and used by Login component
export enum LoginState {
  Authenticating = 'Authenticating',
  Connecting = 'Connecting',
  Loading = 'Loading',
  Error = 'Error',
  Fallback = 'Fallback',
  Connected = 'Connected',
  Initializing = 'Initializing', // Added for default state
}

interface LoginMessageProps {
  state: LoginState;
  error?: string;
}

export function LoginMessage({ state, error }: LoginMessageProps) {
  switch (state) {
    case LoginState.Connecting:
      /**
       * do not animate here, causes rendering engine to waste cycles
       *
       * silk state: soon (~2s) overlays the app with a full-screen iframe
       */
      return (
        <Alert className="text-blue-600">
          <Wallet className="h-5 w-5" />
          <AlertTitle>Connecting wallet... Please wait.</AlertTitle>
        </Alert>
      );
    case LoginState.Authenticating:
      /**
       * wallet connected (silk or metamask)
       * now a request for a signin signature is requested
       */
      return (
        <Alert className="text-green-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <AlertTitle>Authenticating your session...</AlertTitle>
        </Alert>
      );
    case LoginState.Loading:
      /**
       * booting, wagmi or silk not yet loaded
       */
      return (
        <Alert className="text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <AlertTitle>Preparing your login...</AlertTitle>
        </Alert>
      );
    case LoginState.Error:
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>
            An error occurred during login. Please try again.
          </AlertTitle>
          {error !== '' && <AlertDescription>{error}</AlertDescription>}
        </Alert>
      );
    case LoginState.Fallback:
      /**
       * a fallback was selected, waiting for the wallet to signal
       * connected state
       */
      return (
        <Alert className="text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Please connect your wallet to proceed.</AlertTitle>
        </Alert>
      );
    case LoginState.Connected:
      /**
       * login process completed, requested redirect to returnUrl
       */
      return (
        <Alert className="text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <AlertTitle>Wallet connected successfully! Redirecting...</AlertTitle>
        </Alert>
      );
    case LoginState.Initializing:
    /**
     * boot process, wagmi and silk not yet ready
     */
    default:
      return (
        <Alert className="text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <AlertTitle>Initializing login process...</AlertTitle>
        </Alert>
      );
  }
}
