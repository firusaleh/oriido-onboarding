'use client';

import { useRef, useEffect, useState } from 'react';
import SignaturePadLib from 'signature_pad';

interface Props {
  onSign: (signature: string) => void;
  onCancel: () => void;
  signerName: string;
  signerRole: string;
}

export default function SignaturePad({ onSign, onCancel, signerName, signerRole }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const pad = new SignaturePadLib(canvasRef.current, {
        backgroundColor: '#ffffff',
        penColor: '#000000',
      });
      
      // Resize canvas to fit container
      const resizeCanvas = () => {
        if (canvasRef.current) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          const canvas = canvasRef.current;
          const container = canvas.parentElement;
          if (container) {
            canvas.width = container.offsetWidth * ratio;
            canvas.height = 300 * ratio;
            canvas.getContext('2d')?.scale(ratio, ratio);
            canvas.style.width = `${container.offsetWidth}px`;
            canvas.style.height = '300px';
          }
        }
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      pad.addEventListener('endStroke', () => {
        setIsEmpty(pad.isEmpty());
      });
      
      setSignaturePad(pad);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        pad.off();
      };
    }
  }, []);

  const handleClear = () => {
    if (signaturePad) {
      signaturePad.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      const signature = signaturePad.toDataURL('image/png');
      onSign(signature);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Digitale Unterschrift</h2>
          <p className="text-gray-600 mt-1">
            {signerName} ({signerRole})
          </p>
        </div>

        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full touch-none"
            style={{ height: '300px' }}
          />
        </div>

        <div className="text-sm text-gray-600">
          <p>Mit Ihrer Unterschrift bestätigen Sie:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Die Richtigkeit aller Angaben</li>
            <li>Die Zustimmung zu den Vertragsbedingungen</li>
            <li>Die rechtliche Verbindlichkeit dieser digitalen Unterschrift</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClear}
            disabled={isEmpty}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
          >
            Löschen
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unterschrift speichern
          </button>
        </div>
      </div>
    </div>
  );
}