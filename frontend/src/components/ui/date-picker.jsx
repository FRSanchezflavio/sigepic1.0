import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function DatePicker({
  date,
  onSelect,
  placeholder = 'Seleccionar fecha',
  disabled,
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = selectedDate => {
    onSelect(selectedDate);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          'w-full justify-start text-left font-normal h-10',
          !date && 'text-muted-foreground'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? (
          format(date, 'PPP', { locale: es })
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
          <div className="bg-white rounded-lg shadow-2xl">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              initialFocus
              locale={es}
              className="rounded-lg w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
