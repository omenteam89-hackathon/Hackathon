import { format } from 'date-fns';

export { cn } from "cn";

export function formatAppDate(isoString: string): string {
  if (!isoString) return '';
  return format(new Date(isoString), 'd MMM, h:mm a');
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
