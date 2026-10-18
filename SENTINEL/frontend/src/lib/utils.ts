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
      return 'bg-[#e8e2d6] text-[#7a6f63] border border-[#d9d0c0] font-medium';
  }
}

export function getNodeColor(label: string): string {
  switch (label) {
    case 'User':
      return '#8b5cf6'; // Purple for user identities
    case 'Device':
      return '#3b82f6'; // Blue for workstations & endpoints
    case 'Server':
      return '#10b981'; // Mint for internal servers
    case 'Database':
      return '#f59e0b'; // Amber/Gold for crown jewel databases
    case 'IPAddress':
      return '#ec4899'; // Rose for external IP nodes
    case 'SecurityEvent':
      return '#ef4444'; // Red for threat events
    case 'Permission':
      return '#10b981'; // Emerald for IAM permissions
    default:
      return '#10b981'; // Mint fallback
  }
}

