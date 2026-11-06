export const soles = (n: number | null | undefined) => `S/ ${(n ?? 0).toFixed(2)}`;

export function fechaHora(iso: string) {
  const d = new Date(iso);
  const dos = (x: number) => String(x).padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} ${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

export const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.trim());
