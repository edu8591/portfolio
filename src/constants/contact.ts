/** The name of the decoy field. A Visitor never sees it; bots fill it in. */
export const HONEYPOT_FIELD = "website";

/**
 * The address an end-to-end spec submits to drive the delivery-failure path.
 *
 * `.test` is reserved by RFC 6761, so no one can register it and a real Visitor
 * cannot reach this branch by accident. The action recognises it before Resend
 * is called, so the failure costs no quota and needs no network.
 */
export const FORCED_FAILURE_ADDRESS = "fail@example.test";
