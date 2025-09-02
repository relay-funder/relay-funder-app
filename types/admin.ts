/**
 * Defines the various states a camaign approval process can be in.
 * Each state represents a step in the user's interaction with the wallet and blockchain.
 */
export const AdminApproveProcessStates = {
  /**
   * The wallet is not connected to the application.
   * The user will be prompted to connect their wallet.
   * This step may or may not require direct user interaction.
   */
  setup: 'setup',

  /**
   * The wallet is connected but is on the wrong network.
   * The user may be prompted to switch to the correct network or add it if not already configured.
   * This step may or may not require direct user interaction.
   */
  switch: 'switch',

  /**
   * The wallet is asked to execute a contract which returns the on-chain-configured admin address.
   */
  requestAdminAddress: 'requestAdminAddress',

  /**
   * The wallet is asked to execute the treasury factory contract.
   * This action sets the camapaign address active on chain
   */
  treasuryFactory: 'treasuryFactory',

  /**
   * The treasuryFactory contract has been executed, and the application is waiting for blockchain confirmation.
   * No user interaction is required during this phase.
   */
  treasuryFactoryWait: 'treasuryFactoryWait',

  /**
   * The successful execution of the donation is being stored in the application's database.
   * This is typically the final step after blockchain confirmation.
   */
  storageComplete: 'storageComplete',

  /**
   * The initial idle state of the donation process, before any steps have begun.
   */
  idle: 'idle',

  /**
   * The donation process has successfully completed, and the requested funds have been transferred.
   */
  done: 'done',

  /**
   * The donation process has failed at some point.
   * An error message should be displayed to the user.
   */
  failed: 'failed',
};

/**
 * Defines the various states a camaign removal process can be in.
 * Each state represents a step in the user's interaction with the wallet and blockchain.
 */
export const AdminRemoveProcessStates = {
  /**
   * The removal process is starting
   */
  setup: 'setup',

  /**
   * The initial idle state of the process, before any steps have begun.
   */
  idle: 'idle',

  /**
   * The process has successfully completed.
   */
  done: 'done',

  /**
   * The process has failed at some point.
   * An error message should be displayed to the user.
   */
  failed: 'failed',
};

/**
 * Defines the various states a camaign disable process can be in.
 * Each state represents a step in the user's interaction with the wallet and blockchain.
 */
export const AdminDisableProcessStates = {
  /**
   * The disable process is starting
   */
  setup: 'setup',

  /**
   * The initial idle state , before any steps have begun.
   */
  idle: 'idle',

  /**
   * The process successfully completed.
   */
  done: 'done',

  /**
   * The process has failed at some point.
   * An error message should be displayed to the user.
   */
  failed: 'failed',
};
