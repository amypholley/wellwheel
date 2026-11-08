'use client';
import { useEffect, useState } from 'react';
import { loc, t } from '@/lib/i18n';

export const BLOG_URL = 'https://jamieth2032.substack.com/';
type Post = { id: string; title: string; link: string; date: string; author: string; summary: string; image: string; html: string };

const fmt = (d: string) => { const x = new Date(d); return isNaN(+x) ? '' : x.toLocaleDateString(loc(), { month: 'long', day: 'numeric', year: 'numeric' }); };

export function Blog() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<Post | null>(null);
  useEffect(() => {
    fetch('/api/blog').then((r) => r.json()).then((d) => { setPosts(d.posts || []); if (!d.posts?.length && d.error) setFailed(true); }).catch(() => { setPosts([]); setFailed(true); });
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [open]);

  if (open) return (
    <>
      <header className="top"><div><button className="linkish" onClick={() => setOpen(null)}>{t('‹ All posts')}</button></div></header>
      <article className="card blogpost">
        {open.image && <img className="blog-hero" src={open.image} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        <h1>{open.title}</h1>
        <div className="sub">{[open.author, fmt(open.date)].filter(Boolean).join(' · ')}</div>
        <div className="blog-body" dangerouslySetInnerHTML={{ __html: open.html }} />
        <div className="rule" />
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn" onClick={() => setOpen(null)}>{t('‹ All posts')}</button>
          <a className="btn" href={open.link} target="_blank" rel="noopener noreferrer">{t('Comment or share on Substack')}</a>
        </div>
      </article>
    </>
  );

  return (
    <>
      <header className="top"><div><div className="brand">{t('Blog')}</div><h1>{t('From the blog')}</h1><div className="sub">{t('Stories, ideas, and encouragement for every part of your life.')}</div></div></header>
      <div className="stack">
        {posts === null && <section className="card"><p className="sub" style={{ margin: 0 }}>{t('Loading posts…')}</p></section>}
        {failed && <section className="card"><p style={{ marginTop: 0 }}>{t('The blog couldn’t load right now.')}</p><a className="btn primary" href={BLOG_URL} target="_blank" rel="noopener noreferrer">{t('Open the blog')}</a></section>}
        {posts && !failed && posts.length === 0 && <section className="card"><p className="sub" style={{ margin: 0 }}>{t('No posts yet. Check back soon.')}</p></section>}
        {posts?.map((p) => (
          <button key={p.id} className={`card blogcard ${p.image ? '' : 'noimg'}`} onClick={() => setOpen(p)}>
            {p.image && <img src={p.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            <div>
              <div className="sub">{fmt(p.date)}</div>
              <h2>{p.title}</h2>
              {p.summary && <p>{p.summary}</p>}
              <span className="linkish">{t('Read')} ›</span>
            </div>
          </button>
        ))}
        <section className="card">
          <h2>{t('Get new posts by email')}</h2>
          <iframe className="blog-sub" src={BLOG_URL + 'embed'} title={t('Subscribe')} frameBorder={0} scrolling="no" />
        </section>
      </div>
    </>
  );
}
