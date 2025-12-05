interface Props {
  params: { id: string };
}

export default function SolicitacaoPage({ params }: Props) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Solicitação #{params.id}</h1>
      <p>Detalhes da solicitação...</p>
    </div>
  );
}
