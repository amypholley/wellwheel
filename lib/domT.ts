// Translates the worksheet and Adventures pages, which are drawn as plain HTML strings rather than React.
// Watches the container and swaps each piece of English text for the chosen language as it appears.
import { lang, tdom } from './i18n';

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const SKIP = 'textarea,script,style,[data-notr],[contenteditable]';

export function translateTree(root: HTMLElement): () => void {
  if (lang() === 'en') return () => {};
  const mine = new WeakMap<Node, string>(); // text we set ourselves, so we don't redo it
  const doText = (n: Text) => {
    const v = n.nodeValue || '';
    if (mine.get(n) === v) return;
    const p = n.parentElement; if (!p || p.closest(SKIP)) return;
    const r = tdom(v);
    if (r !== null) { mine.set(n, r); n.nodeValue = r; } else mine.set(n, v);
  };
  const doEl = (el: Element) => {
    for (const a of ATTRS) { const v = el.getAttribute(a); if (v) { const r = tdom(v); if (r !== null) el.setAttribute(a, r); } }
  };
  const walk = (node: Node) => {
    if (node.nodeType === 3) { doText(node as Text); return; }
    if (node.nodeType !== 1) return;
    const el = node as Element; doEl(el);
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let c: Node | null;
    while ((c = w.nextNode())) { if (c.nodeType === 3) doText(c as Text); else doEl(c as Element); }
  };
  walk(root);
  const mo = new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === 'characterData') doText(m.target as Text);
      else if (m.type === 'attributes') doEl(m.target as Element);
      else m.addedNodes.forEach(walk);
    }
  });
  mo.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  return () => mo.disconnect();
}
// For toasts and other messages the worksheets show
export const tmsg = (s: string) => tdom(s) ?? s;
