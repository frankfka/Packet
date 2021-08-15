import { formatISO, parseISO } from 'date-fns';

export const dateToIsoString = (date: Date) => formatISO(date);

export const dateFromIsoString = (isoDateStr: string) => parseISO(isoDateStr);
