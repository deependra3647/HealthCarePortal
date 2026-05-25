const COLORS = [
  'var(--avatar-1)',
  'var(--avatar-2)',
  'var(--avatar-3)',
  'var(--avatar-4)',
  'var(--avatar-5)',
];

function hash(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % COLORS.length;
}

export default function Avatar({ name, size = 'md' }) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className={`avatar avatar-${size}`}
      style={{ background: COLORS[hash(name)] }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
