import { Loader2 } from 'lucide-react';

export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
