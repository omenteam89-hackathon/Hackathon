import { Play, FileAudio } from 'lucide-react';

interface EvidenceThumbProps {
  file: {
    kind: 'image' | 'video' | 'audio';
    dataUrl: string;
    name: string;
  };
}

export default function EvidenceThumb({ file }: EvidenceThumbProps) {
  return (
    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted/10 border border-border cursor-pointer group">
      {file.kind === 'image' && (
        <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
      )}
      {file.kind === 'video' && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Play className="w-6 h-6 text-muted group-hover:text-ink transition-colors" />
        </div>
      )}
      {file.kind === 'audio' && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <FileAudio className="w-6 h-6 text-muted group-hover:text-ink transition-colors" />
        </div>
      )}
    </div>
  );
}
