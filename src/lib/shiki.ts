import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
// JavaScript RegExp engine — REQUIRED on Cloudflare Workers (the default
// Oniguruma/WASM engine does not work in the Workers runtime).
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import githubLight from '@shikijs/themes/github-light'
// Import only the languages we use (keeps the Worker bundle small).
import typescript from '@shikijs/langs/typescript'
import tsx from '@shikijs/langs/tsx'
import javascript from '@shikijs/langs/javascript'
import jsx from '@shikijs/langs/jsx'
import json from '@shikijs/langs/json'
import bash from '@shikijs/langs/bash'
import css from '@shikijs/langs/css'
import html from '@shikijs/langs/html'
import markdown from '@shikijs/langs/markdown'
import rust from '@shikijs/langs/rust'
import python from '@shikijs/langs/python'
import sql from '@shikijs/langs/sql'
import yaml from '@shikijs/langs/yaml'
import java from '@shikijs/langs/java'
import kotlin from '@shikijs/langs/kotlin'
import xml from '@shikijs/langs/xml'
import c from '@shikijs/langs/c'
import go from '@shikijs/langs/go'
import dockerfile from '@shikijs/langs/dockerfile'
import diff from '@shikijs/langs/diff'

// Created once at module scope and reused across requests.
let _hl: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  if (!_hl) {
    _hl = createHighlighterCore({
      themes: [githubLight],
      langs: [
        typescript,
        tsx,
        javascript,
        jsx,
        json,
        bash,
        css,
        html,
        markdown,
        rust,
        python,
        sql,
        yaml,
        java,
        kotlin,
        xml,
        c,
        go,
        dockerfile,
        diff,
      ],
      engine: createJavaScriptRegexEngine(),
    })
  }
  return _hl
}
