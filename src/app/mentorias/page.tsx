import { prisma } from '@/src/lib/prisma';
import React from 'react';

// This page lists all scheduled mentorships (entrevista_mentor) for the logged‑in candidate.
// In a real app you would filter by the candidate's user id from the session.
// For now we simply fetch all records to demonstrate the UI.

export const revalidate = 0; // Disable ISR, always fresh data

export default async function MentoriasPage() {
  const entrevistasRaw = await prisma.entrevista_mentor.findMany({
    orderBy: { data: 'desc' },
  });

  const entrevistas = await Promise.all(
    entrevistasRaw.map(async (e) => {
      const mentor = await prisma.mentor.findUnique({
        where: { id: e.mentor_id },
        select: {
          nome: true,
          sobrenome: true,
        },
      });
      return {
        ...e,
        mentor,
      };
    })
  );

  return (
    <section className="mentorias-page">
      <h1 className="title">Minhas Mentorias</h1>
      {entrevistas.length === 0 ? (
        <p className="empty-state">Você ainda não tem mentorias agendadas.</p>
      ) : (
        <ul className="list">
          {entrevistas.map((e) => (
            <li key={e.id} className="card">
              <div className="header">
                <strong className="mentor-name">
                  {e.mentor?.nome ?? ''} {e.mentor?.sobrenome ?? ''}
                </strong>
                <span className="status">{e.status}</span>
              </div>
              <div className="details">
                <span>{e.data}</span>
                <span>{e.hora_inicio} – {e.hora_fim}</span>
              </div>
              {e.link_reuniao && (
                <a href={e.link_reuniao} target="_blank" rel="noopener" className="link">
                  Entrar na reunião
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
