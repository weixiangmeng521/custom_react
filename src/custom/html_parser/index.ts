import lexer from './lexer'
import parser from './parser'
import { format } from './format'
import { toHTML } from './stringify'
import {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers,
} from './tags'

export const parseDefaults = {
  voidTags,
  closingTags,
  childlessTags,
  closingTagAncestorBreakers,
  includePositions: false,
}

export function parse(str:string, options = parseDefaults) {
  const tokens = lexer(str, options)
  const nodes = parser(tokens, options)
  return format(nodes, options)
}

export function stringify(ast:any, options = parseDefaults) {
  return toHTML(ast, options)
}
