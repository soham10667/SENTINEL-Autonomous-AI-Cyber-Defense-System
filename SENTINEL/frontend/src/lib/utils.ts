import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(isoString?: string): string {
  if (!isoString) return '--:--:--';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return isoString;
  }
}

export function getSeverityBadgeClass(sev: string): string {
  switch (sev?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border border-red-200 font-bold shadow-sm';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border border-orange-200 font-bold shadow-sm';
    case 'MEDIUM':
      return 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';
    case 'LOW':
      return 'bg-blue-50 text-blue-700 border border-blue-200 font-bold';
    case 'SAFE':
    case 'VERIFIED':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
    default:
      return 'bg-[#FFF9FC] text-[#77717A] border border-[#F5E1E9] font-medium';
  }
}

export function getNodeColor(label: string): string {
  switch (label) {
    case 'User':
      return '#F4A7C1'; // Primary Soft Pink
    case 'Device':
      return '#E88DAD'; // Button / Soft Rose Pink
    case 'Server':
      return '#D9769B'; // Deeper Soft Pink
    case 'Database':
      return '#f59e0b'; // Amber / Gold (Preserved warning/crown jewel target)
    case 'IPAddress':
      return '#FBCFE8'; // Pastel Pink
    case 'SecurityEvent':
      return '#ef4444'; // Red (Preserved for critical threats)
    case 'Permission':
      return '#10b981'; // Emerald (Preserved for verified-safe systems)
    default:
      return '#F4A7C1'; // Soft pink fallback
  }
}
