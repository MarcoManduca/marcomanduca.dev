import type { Element, ElementContent, Root } from 'hast'
import { toText } from 'hast-util-to-text'
import bash from 'highlight.js/lib/languages/bash'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import ini from 'highlight.js/lib/languages/ini'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import plaintext from 'highlight.js/lib/languages/plaintext'
import python from 'highlight.js/lib/languages/python'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import yaml from 'highlight.js/lib/languages/yaml'
import { createLowlight } from 'lowlight'
import { visit } from 'unist-util-visit'

/**
 * The languages the content uses (their aliases come along: ts, js, py, sh,
 * yml, toml, ...). rehype-highlight bundles highlight.js's 37 "common"
 * grammars even when told to register fewer, so this small plugin replaces
 * it. There is no HCL grammar in highlight.js: such blocks stay plain.
 */
const lowlight = createLowlight({
  bash,
  dockerfile,
  ini,
  javascript,
  json,
  plaintext,
  python,
  shell,
  sql,
  typescript,
  yaml,
})

const LANGUAGE_CLASS = /^lang(?:uage)?-(.+)$/

/** The language a fenced block gave its code element, if any. */
const languageOf = (node: Element): string | null => {
  const classes = node.properties.className
  const names = Array.isArray(classes) ? classes.map(String) : []
  const match = names.map((name) => LANGUAGE_CLASS.exec(name)).find(Boolean)
  return match ? match[1] : null
}

/**
 * rehype plugin: syntax-highlight fenced code blocks with a language.
 *
 * Like rehype-highlight, blocks get the `hljs` class (the theme's block
 * style) and token spans for registered languages; unknown languages keep
 * their plain text, and blocks without a language are left untouched.
 */
export const rehypeHighlight = () => (tree: Root) => {
  visit(tree, 'element', (node, _index, parent) => {
    if (node.tagName !== 'code' || parent?.type !== 'element') return
    if (parent.tagName !== 'pre') return
    const language = languageOf(node)
    if (!language) return

    const classes = node.properties.className
    node.properties.className = [
      'hljs',
      ...(Array.isArray(classes) ? classes : []),
    ]
    if (!lowlight.registered(language)) return

    const text = toText(node, { whitespace: 'pre' })
    node.children = lowlight.highlight(language, text)
      .children as ElementContent[]
  })
}
