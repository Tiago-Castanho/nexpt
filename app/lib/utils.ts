import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função para gerir classes do Tailwind (útil se quiseres adicionar condicionais)
 * Requer: npm install clsx tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Limpa o nome do destino (Ex: "LISBOA - ORIENTE" -> "Lisboa Oriente")
 */
export function formatStationName(name: string) {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(' - ', ' ');
}

/**
 * Calcula a diferença de tempo (se quiseres mostrar "Em 5 min")
 */
export function getMinutesUntil(scheduledTime: string) {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const now = new Date();
  const trainTime = new Date();
  trainTime.setHours(hours, minutes, 0);

  const diff = Math.round((trainTime.getTime() - now.getTime()) / 60000);
  return diff;
}