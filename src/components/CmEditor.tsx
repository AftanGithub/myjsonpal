import { useEffect, useMemo, useRef } from 'react';
import { EditorState, StateEffect, type Extension } from '@codemirror/state';
import { EditorView, placeholder } from '@codemirror/view';

interface CmEditorProps {
  value: string;
  onChange?: (value: string) => void;
  extensions?: Extension[];
  readOnly?: boolean;
  placeholder?: string;
}

export default function CmEditor({
  value,
  onChange,
  extensions = [],
  readOnly = false,
  placeholder: placeholderText = '',
}: CmEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const fullExtensions = useMemo(() => {
    return [
      ...(readOnly ? [EditorState.readOnly.of(true), EditorView.editable.of(false)] : []),
      ...extensions,
      placeholder(placeholderText),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString());
        }
      }),
      EditorView.contentAttributes.of({ 'aria-label': placeholderText || 'Code editor' }),
    ];
  }, [readOnly, extensions, placeholderText]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: fullExtensions,
      }),
      parent: container,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== current) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: StateEffect.reconfigure.of(fullExtensions) });
  }, [fullExtensions]);

  return <div ref={containerRef} className="h-full min-h-0" />;
}

