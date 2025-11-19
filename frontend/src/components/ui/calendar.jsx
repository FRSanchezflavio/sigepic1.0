import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-0', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4 w-full',
        caption:
          'flex justify-center pt-4 pb-4 relative items-center bg-gradient-to-r from-police-navy to-police-cyan rounded-t-lg',
        caption_label: 'text-lg font-bold text-white',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-9 w-9 bg-white/20 hover:bg-white/30 text-white border-0 p-0 opacity-90 hover:opacity-100 transition-all rounded-lg backdrop-blur-sm'
        ),
        nav_button_previous: 'absolute left-3',
        nav_button_next: 'absolute right-3',
        table: 'w-full border-collapse mt-4 px-4 pb-4',
        head_row: 'flex w-full mb-2',
        head_cell:
          'text-slate-600 rounded-md flex-1 font-bold text-xs uppercase text-center py-2',
        row: 'flex w-full mt-1',
        cell: 'flex-1 text-center text-sm p-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          'h-11 w-full p-0 font-semibold text-slate-700 hover:bg-police-cyan/20 hover:text-police-navy transition-all rounded-lg aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-gradient-to-br from-police-navy to-police-cyan text-white hover:from-police-navy-dark hover:to-police-cyan hover:text-white focus:from-police-navy focus:to-police-cyan focus:text-white font-bold shadow-md scale-105',
        day_today:
          'bg-police-cyan/20 text-police-navy font-bold border-2 border-police-cyan ring-2 ring-police-cyan/30',
        day_outside:
          'day-outside text-slate-300 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled:
          'text-slate-200 opacity-30 cursor-not-allowed hover:bg-transparent',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
