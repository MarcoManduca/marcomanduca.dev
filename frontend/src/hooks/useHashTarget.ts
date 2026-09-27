import { useLocation } from 'react-router'

/** Element id the URL hash points at: `work-2020-11` for `#work-2020-11`. */
export const useHashTarget = () => useLocation().hash.slice(1)
