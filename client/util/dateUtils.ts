import { format, formatISO, parseISO } from 'date-fns';

export const dateToIsoString = (date: Date) => formatISO(date);

export const dateFromIsoString = (isoDateStr: string) => parseISO(isoDateStr);

export const formatDate = (
  date: Date,
  formatStr: string = 'h:mm aa - MMM d, yyyy'
) => {
  return format(date, formatStr);
};
