/**
 * React Router v7 behaviours opted into early, shared by the app router and
 * the test routers so both run with the same semantics (and no warnings).
 */
export const ROUTER_FUTURE_FLAGS = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const
