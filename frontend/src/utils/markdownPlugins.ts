import remarkMath from 'remark-math'
import type { PluggableList } from 'unified'

import { remarkHeadingIds } from './remarkHeadingIds'

/**
 * remark plugins shared by the renderer (`MarkdownContent`) and the table of
 * contents (`markdownHeadings`): both must parse the same syntax and assign
 * the same heading ids.
 */
export const REMARK_PLUGINS: PluggableList = [remarkMath, remarkHeadingIds]
