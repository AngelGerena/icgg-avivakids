import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORING_STORIES, CRAYON_COLORS, Shape } from '../data/coloringStories';
import { Paintbrush, Eraser, Undo2, RotateCcw, Download, Printer, ArrowLeft } from 'lucide-react';
import './ColoringBook.css';

type Fills = Record<string, Record<number, string>>;
const STORAGE_KEY = 'avk-coloring-v1';
const WHITE = '#FFFFFF';
const INK = '#1B2452';

const loadFills = (): Fills => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveFills = (f: Fills) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  } catch {
    /* storage blocked: coloring still works for this visit */
  }
};

// Builds a standalone SVG string so the page can be turned into a PNG or PDF.
const shapeToSvg = (s: Shape, fill: string) => {
  const stroke = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  if (s.kind === 'path') return s.line ? `<path d="${s.d}" fill="none" ${stroke}/>` : `<path d="${s.d}" fill="${fill}" ${stroke}/>`;
  if (s.kind === 'circle') return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${fill}" ${stroke}/>`;
  if (s.kind === 'ellipse') return `<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="${fill}" ${stroke}/>`;
  return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx ?? 0}" fill="${fill}" ${stroke}/>`;
};

const buildSvg = (shapes: Shape[], fills: Record<number, string>) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="1200" height="960">${shapes
    .map((s, i) => shapeToSvg(s, fills[i] || WHITE))
    .join('')}</svg>`;

const svgToPng = (svg: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no canvas'));
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

const deliverFile = async (blob: Blob, filename: string) => {
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  // On phones, the share sheet lets parents tap "Save Image" straight into Photos.
  if (nav.canShare && nav.canShare({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const ColoringBook = () => {
  const { language } = useLanguage();
  const lang: 'en' | 'es' = language === 'es' ? 'es' : 'en';
  const [storyIdx, setStoryIdx] = useState(0);
  const [color, setColor] = useState(CRAYON_COLORS[2]);
  const [mode, setMode] = useState<'fill' | 'erase'>('fill');
  const [fills, setFills] = useState<Fills>(loadFills);
  const [history, setHistory] = useState<Record<string, [number, string][]>>({});
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const toastTimer = useRef<number>();

  const story = COLORING_STORIES[storyIdx];
  const storyFills = fills[story.id] || {};

  const T =
    lang === 'es'
      ? {
          title: 'Libro para Colorear',
          sub: 'Toca un color y luego toca el dibujo para pintarlo.',
          color: 'Color', erase: 'Borrador', undo: 'Deshacer', clear: 'Empezar', save: 'Guardar', print: 'Imprimir',
          nothing: 'Todavía no hay nada que deshacer.', cleared: 'Página nueva. ¡A divertirse!',
          saving: 'Preparando tu dibujo...', saved: '¡Listo! Tu dibujo se guardó.', printReady: 'Página para imprimir lista.',
          failed: 'No se pudo guardar. Inténtalo otra vez.', stories: 'Historias', colors: 'Colores', back: 'Inicio',
          parents: 'Padres: lo que pinten se queda en este teléfono. No pedimos nombres ni cuentas.',
        }
      : {
          title: 'Coloring Book',
          sub: 'Tap a color, then tap the picture to paint it.',
          color: 'Color', erase: 'Eraser', undo: 'Undo', clear: 'Start over', save: 'Save', print: 'Print',
          nothing: 'Nothing to undo yet.', cleared: 'Fresh page. Have fun!',
          saving: 'Getting your picture ready...', saved: 'Done! Your picture was saved.', printReady: 'Printable page is ready.',
          failed: "Couldn't save. Please try again.", stories: 'Stories', colors: 'Colors', back: 'Home',
          parents: 'Parents: coloring stays on this phone. No names or accounts needed.',
        };

  useEffect(() => saveFills(fills), [fills]);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3200);
  };

  const paint = (i: number) => {
    const next = mode === 'erase' ? WHITE : color;
    const prev = storyFills[i] || WHITE;
    if (prev === next) return;
    setHistory((h) => ({ ...h, [story.id]: [...(h[story.id] || []), [i, prev]] }));
    setFills((f) => ({ ...f, [story.id]: { ...(f[story.id] || {}), [i]: next } }));
  };

  const undo = () => {
    const h = history[story.id];
    if (!h || !h.length) return showToast(T.nothing);
    const [i, prev] = h[h.length - 1];
    setHistory((all) => ({ ...all, [story.id]: h.slice(0, -1) }));
    setFills((f) => ({ ...f, [story.id]: { ...(f[story.id] || {}), [i]: prev } }));
  };

  const clear = () => {
    setFills((f) => ({ ...f, [story.id]: {} }));
    setHistory((h) => ({ ...h, [story.id]: [] }));
    showToast(T.cleared);
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    showToast(T.saving);
    try {
      const png = await svgToPng(buildSvg(story.shapes, storyFills));
      const blob = await (await fetch(png)).blob();
      await deliverFile(blob, `aviva-kids-${story.id}.png`);
      showToast(T.saved);
    } catch {
      showToast(T.failed);
    } finally {
      setBusy(false);
    }
  };

  const print = async () => {
    if (busy) return;
    setBusy(true);
    showToast(T.saving);
    try {
      const { jsPDF } = await import('jspdf');
      const png = await svgToPng(buildSvg(story.shapes, {}));
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const W = doc.internal.pageSize.getWidth();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text(story.title[lang], W / 2, 64, { align: 'center' });
      const imgW = W - 96;
      doc.addImage(png, 'PNG', 48, 90, imgW, imgW * 0.8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(15);
      const lines = doc.splitTextToSize(story.verse[lang], W - 120);
      const y = 90 + imgW * 0.8 + 40;
      doc.text(lines, W / 2, y, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(story.ref[lang], W / 2, y + lines.length * 18 + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('ICGG Aviva Kids · icgg-avivakids.org', W / 2, doc.internal.pageSize.getHeight() - 30, { align: 'center' });
      await deliverFile(doc.output('blob'), `aviva-kids-${story.id}-print.pdf`);
      showToast(T.printReady);
    } catch {
      showToast(T.failed);
    } finally {
      setBusy(false);
    }
  };

  const renderShape = (s: Shape, i: number) => {
    const fill = storyFills[i] || WHITE;
    const common = {
      key: i,
      className: 'cb-region',
      fill,
      stroke: INK,
      strokeWidth: 3,
      strokeLinejoin: 'round' as const,
      onClick: () => paint(i),
    };
    if (s.kind === 'path')
      return s.line ? (
        <path key={i} d={s.d} className="cb-line" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      ) : (
        <path {...common} d={s.d} />
      );
    if (s.kind === 'circle') return <circle {...common} cx={s.cx} cy={s.cy} r={s.r} />;
    if (s.kind === 'ellipse') return <ellipse {...common} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
    return <rect {...common} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} />;
  };

  return (
    <div className="cb-wrap">
      <div className="cb-app">
        <div className="cb-bar">
          <Link to="/" className="cb-back" aria-label={T.back}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="cb-title">{T.title}</h1>
            <p className="cb-sub">{T.sub}</p>
          </div>
        </div>

        <div className="cb-stories" role="group" aria-label={T.stories}>
          {COLORING_STORIES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="cb-chip"
              aria-pressed={i === storyIdx}
              onClick={() => setStoryIdx(i)}
            >
              {s.title[lang]}
            </button>
          ))}
        </div>

        <div className="cb-page">
          <svg className="cb-art" viewBox="0 0 400 320" role="img" aria-label={story.title[lang]}>
            {story.shapes.map(renderShape)}
          </svg>
          <div className="cb-caption">
            <h2>{story.title[lang]}</h2>
            <p>{story.verse[lang]}</p>
            <cite>{story.ref[lang]}</cite>
          </div>
        </div>

        <div className="cb-tools">
          <button type="button" className="cb-tool" aria-pressed={mode === 'fill'} onClick={() => setMode('fill')}>
            <Paintbrush /> <span>{T.color}</span>
          </button>
          <button type="button" className="cb-tool" aria-pressed={mode === 'erase'} onClick={() => setMode('erase')}>
            <Eraser /> <span>{T.erase}</span>
          </button>
          <button type="button" className="cb-tool" onClick={undo}>
            <Undo2 /> <span>{T.undo}</span>
          </button>
          <button type="button" className="cb-tool" onClick={clear}>
            <RotateCcw /> <span>{T.clear}</span>
          </button>
        </div>

        <div className="cb-swatches" role="group" aria-label={T.colors}>
          {CRAYON_COLORS.map((c, i) => (
            <button
              key={c}
              type="button"
              className="cb-crayon"
              style={{ background: c }}
              aria-label={`${T.color} ${i + 1}`}
              aria-pressed={mode === 'fill' && c === color}
              onClick={() => {
                setColor(c);
                setMode('fill');
              }}
            />
          ))}
        </div>

        <div className="cb-actions">
          <button type="button" className="cb-action cb-save" onClick={save} disabled={busy}>
            <Download className="w-5 h-5" /> {T.save}
          </button>
          <button type="button" className="cb-action cb-print" onClick={print} disabled={busy}>
            <Printer className="w-5 h-5" /> {T.print}
          </button>
        </div>

        <p className="cb-toast" aria-live="polite">{toast}</p>
        <p className="cb-note">{T.parents}</p>
      </div>
    </div>
  );
};
