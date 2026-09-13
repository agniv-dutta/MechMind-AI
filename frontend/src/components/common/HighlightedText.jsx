import React from 'react';

export default function HighlightedText({ text = '', query = '' }) {
  const terms = query.trim().split(/\s+/).filter((term) => term.length > 1).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!terms.length) return text;
  const parts = String(text).split(new RegExp(`(${terms.join('|')})`, 'gi'));
  return <>{parts.map((part, index) => new RegExp(`^(${terms.join('|')})$`, 'i').test(part) ? <mark key={index} className="rounded bg-amber-200 px-0.5 text-inherit">{part}</mark> : <React.Fragment key={index}>{part}</React.Fragment>)}</>;
}
