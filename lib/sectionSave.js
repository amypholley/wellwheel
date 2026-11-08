// Adds a small Save button to any section where people type something but there's no button to press.
// Typing already saves automatically; the button is there so people can confirm it.
// attr: the data attribute the engine uses for typed fields ('b' for worksheets, 'av' for adventures)
// action: [attribute name, value] for the button the engine already handles, e.g. ['data-r', 'savenow']
const OWN_BUTTONS = '[data-r="saveentry"],[data-r="dbtsave"],[data-r="gsave"],[data-r="savenow"],[data-a="saveplace"],[data-a="savenow"],[data-r="mgoal"],[data-a="crdone"],[data-r="sermsave"]';
export function addSectionSaves(root, attr, [actAttr, actVal]) {
  root.querySelectorAll('section.card, details.card').forEach((sec) => {
    if (sec.querySelector('.card')) return; // only the innermost sections
    if (sec.querySelector(OWN_BUTTONS)) return;
    const typed = [...sec.querySelectorAll(`[data-${attr}]`)].some((el) => {
      if (el.closest('form')) return false;
      const t = (el.getAttribute('type') || '').toLowerCase();
      return el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && t !== 'checkbox' && t !== 'radio' && t !== 'file' && t !== 'hidden');
    });
    if (!typed) return;
    const wrap = document.createElement('div');
    wrap.className = 'secsave';
    wrap.innerHTML = `<span class="sub">Saves as you type</span><button type="button" class="btn small" ${actAttr}="${actVal}">Save</button>`;
    sec.appendChild(wrap);
  });
}
