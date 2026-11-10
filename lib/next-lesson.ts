export type LessonRow = {
  id: string; title: string; kind: string; est_minutes: number; position: number;
  units?: { position: number; title: string; modules?: { position: number; level_code: string } | null } | null;
};

export function sortLessons(lessons: LessonRow[]): LessonRow[] {
  const key = (l: LessonRow) => [l.units?.modules?.level_code ?? "", l.units?.modules?.position ?? 0, l.units?.position ?? 0, l.position];
  return [...lessons].sort((a, b) => {
    const A = key(a), B = key(b);
    for (let i = 0; i < 4; i++) if (A[i] !== B[i]) return A[i] < B[i] ? -1 : 1;
    return 0;
  });
}

export const LESSON_SELECT = "id, title, kind, est_minutes, position, units(position, title, modules(position, level_code))";
