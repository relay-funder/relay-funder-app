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
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Wallet className="h-4 w-4" />
          <span className="text-sm">Connecting wallet... Please wait.</span>
        </div>
      );
    case LoginState.Authenticating:
      /**
       * wallet connected (silk or metamask)
       * now a request for a signin signature is requested
       */
      return (
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Authenticating your session...</span>
        </div>
      );
    case LoginState.Loading:
      /**
       * booting, wagmi or silk not yet loaded
       */
      return (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Preparing your login...</span>
        </div>
      );
    case LoginState.Error:
      return (
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">
            An error occurred during login. Please try again.
          </AlertTitle>
          {error !== '' && (
            <AlertDescription className="text-xs">{error}</AlertDescription>
          )}
        </Alert>
      );
    case LoginState.Fallback:
      /**
       * a fallback was selected, waiting for the wallet to signal
       * connected state
       */
      return (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Please connect your wallet to proceed.
          </span>
        </div>
      );
    case LoginState.Connected:
      /**
       * login process completed, requested redirect to returnUrl
       */
      return (
        <div className="flex items-center justify-center gap-2 text-gray-700">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm">
            Wallet connected successfully! Redirecting...
          </span>
        </div>
      );
    case LoginState.Initializing:
    /**
     * boot process, wagmi and silk not yet ready
     */
    default:
      return (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Initializing login process...</span>
        </div>
      );
  }
}
