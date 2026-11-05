// Shared layout for the Privacy Policy and Terms of Service pages.
export const LEGAL = {
  business: 'The Holistic Ecosystem',
  state: 'Texas',
  contact: 'hello@theholisticecosystem.com',
  effective: 'November 5, 2026',
};

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="app legal">
      <header className="top">
        <div>
          <a className="linkish" href="/">← Back to WellWheel</a>
          <div className="brand" style={{ marginTop: 12 }}>WellWheel · {LEGAL.business}</div>
          <h1>{title}</h1>
          <div className="sub">Effective {LEGAL.effective}</div>
        </div>
      </header>
      <div className="stack">{children}</div>
      <p className="hint" style={{ textAlign: 'center', margin: '24px 0' }}>
        <a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a> · Questions? <a href={`mailto:${LEGAL.contact}`}>{LEGAL.contact}</a>
      </p>
    </div>
  );
}

export function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card"><h2>{title}</h2><div className="rule" />{children}</section>;
}
