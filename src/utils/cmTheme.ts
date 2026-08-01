import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * CodeMirror theme driven entirely by CSS custom properties, so the editor
 * re-themes automatically when the site flips between dark and light modes.
 */
export const editorTheme = EditorView.theme(
  {
    '&': {
      height: '100%',
      backgroundColor: 'var(--editor-bg)',
      color: 'var(--editor-fg)',
      fontSize: '13px',
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-mono)',
      lineHeight: '1.6',
      overflow: 'auto',
    },
    '.cm-content': {
      padding: '12px 0',
      caretColor: 'var(--editor-cursor)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--editor-cursor)',
    },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'var(--editor-selection) !important',
      },
    '.cm-activeLine': {
      backgroundColor: 'var(--editor-active-line)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--editor-active-line)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--editor-gutter-bg)',
      color: 'var(--editor-gutter)',
      border: 'none',
      borderRight: '1px solid var(--editor-gutter-border)',
      fontSize: '12px',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      padding: '0 10px 0 8px',
      minWidth: '32px',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-hairline)',
      color: 'var(--editor-faint)',
      padding: '0 4px',
      borderRadius: '4px',
    },
    '.cm-tooltip': {
      border: '1px solid var(--color-hairline)',
      borderRadius: '6px',
      backgroundColor: 'var(--color-elevated)',
      color: 'var(--color-ink)',
      boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.18)',
      overflow: 'hidden',
    },
    '.cm-diagnostic': {
      padding: '2px 8px',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
    },
    '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': {
      backgroundColor: 'var(--editor-selection)',
      outline: '1px solid var(--color-hairline)',
    },
    '.cm-panels': {
      backgroundColor: 'var(--color-elevated)',
      color: 'var(--color-ink)',
    },
    '&.cm-focused': {
      outline: 'none',
    },
  },
  { dark: true },
);

const geistHighlight = HighlightStyle.define([
  { tag: t.propertyName, color: 'var(--syn-property)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--syn-string)' },
  { tag: [t.number], color: 'var(--syn-number)' },
  { tag: [t.bool, t.null, t.atom], color: 'var(--syn-bool)' },
  { tag: [t.keyword, t.operatorKeyword], color: 'var(--syn-keyword)' },
  { tag: [t.comment], color: 'var(--syn-comment)', fontStyle: 'italic' },
  { tag: [t.punctuation, t.operator, t.separator, t.bracket], color: 'var(--syn-punct)' },
  { tag: [t.typeName, t.className], color: 'var(--syn-property)' },
  { tag: [t.variableName, t.function(t.variableName), t.definition(t.variableName)], color: 'var(--editor-fg)' },
]);

export const editorHighlight = syntaxHighlighting(geistHighlight);
