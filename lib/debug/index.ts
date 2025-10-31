import { IS_PRODUCTION } from '@/lib/constant';

export const debug = !IS_PRODUCTION;
export const debugWeb3 = debug;
export const debugWeb3UseAuth = debugWeb3;
export const debugWeb3ContextProvider = debugWeb3;
export const debugWeb3AdapterSilkConnector = debugWeb3;
export const debugApi = debug;
export const debugLib = debug;
export const debugComponentData = debug;
export const debugAuth = debug;
export const debugHook = debug;
export const debugQf = process.env.NEXT_PUBLIC_DEBUG_QF === 'true' || false;
