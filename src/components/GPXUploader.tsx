import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Mountain, MapPin, Timer, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { parseGPX } from '@/lib/gpx';
import { formatDuration, formatPace } from '@/lib/format';
import type { GPXResult } from '@/types';

interface GPXUploaderProps {
  onImport: (result: GPXResult) => void;
}

export default function GPXUploader({ onImport }: GPXUploaderProps) {
  const { t, lang } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<GPXResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setStatus('error');
      return;
    }
    setStatus('parsing');
    try {
      const text = await file.text();
      const parsed = parseGPX(text);
      setResult(parsed);
      setStatus('success');
      onImport(parsed);
    } catch {
      setStatus('error');
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver
            ? 'border-orange-500 bg-orange-500/10'
            : status === 'error'
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-neutral-700 bg-neutral-900/40 hover:border-neutral-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".gpx"
          onChange={handleInputChange}
          className="hidden"
        />
        {status === 'parsing' ? (
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-orange-500" />
            <p className="mt-3 text-sm text-neutral-400">{t('map.gpxParsing')}</p>
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="mb-2 h-10 w-10 text-red-400" />
            <p className="text-sm text-red-400">{t('map.gpxError')}</p>
          </div>
        ) : status === 'success' && result ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="mb-2 h-10 w-10 text-green-400" />
            <p className="text-sm text-green-400">{t('map.gpxSuccess')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
              <Upload className="h-7 w-7 text-orange-400" />
            </div>
            <p className="font-medium text-white">{t('map.gpxUpload')}</p>
            <p className="mt-1 text-xs text-neutral-500">{t('map.gpxDrop')}</p>
            <p className="mt-2 text-[11px] text-neutral-600">{t('map.gpxSupported')}</p>
          </div>
        )}
      </div>

      {status === 'success' && result && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">{t('map.importedFrom')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <MapPin className="mx-auto mb-1 h-4 w-4 text-orange-400" />
              <p className="text-xs text-neutral-500">{t('log.distance')}</p>
              <p className="font-bold text-white">{result.distanceKm.toFixed(2)} km</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <Timer className="mx-auto mb-1 h-4 w-4 text-blue-400" />
              <p className="text-xs text-neutral-500">{t('log.time')}</p>
              <p className="font-bold text-white">{formatDuration(result.durationMin, lang)}</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <TrendingUp className="mx-auto mb-1 h-4 w-4 text-green-400" />
              <p className="text-xs text-neutral-500">{t('log.pace')}</p>
              <p className="font-bold text-white">{formatPace(result.avgPaceSecPerKm)}/km</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <Mountain className="mx-auto mb-1 h-4 w-4 text-yellow-400" />
              <p className="text-xs text-neutral-500">{t('map.elevation')}</p>
              <p className="font-bold text-white">{result.elevationGain.toFixed(0)} m</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
