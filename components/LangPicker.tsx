'use client';
import { LANGS, t } from '@/lib/i18n';
import { useWW } from './store';

// Choose the app's language. Names are shown in their own language so anyone can find theirs.
export function LangPicker({ compact = false }: { compact?: boolean }) {
  const { lang, changeLang } = useWW();
  return (
    <label className={`langpick ${compact ? 'compact' : ''}`}>
      <span aria-hidden="true">🌐</span>{!compact && <span className="lbl" style={{ margin: 0 }}>{t('Language')}</span>}
      <select value={lang} aria-label={t("Language")} onChange={(e) => changeLang(e.target.value)}>
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.name}{l.code !== 'en' ? ` · ${l.english}` : ''}</option>)}
      </select>
    </label>
  );
}
