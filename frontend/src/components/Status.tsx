export function Status({ value }: { value: string }) {
  const cls =
    value === 'Concluída'
      ? 'done'
      : value === 'Pendente'
        ? 'pending'
        : value === 'Em execução'
          ? 'progress'
          : value === 'Indeferida'
            ? 'rejected'
            : 'analysis';

  return (
    <span className={`pill ${cls}`}>
      <i />
      {value}
    </span>
  );
}
