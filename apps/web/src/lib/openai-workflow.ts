/**
 * Placeholder para integrar el SDK de OpenAI (Assistants/Responses/Workers).
 * Cambiá el contenido de esta función para invocar tu workflow real.
 */
export async function runWorkflow({ id, input }: { id: string; input: string }) {
  await new Promise((r) => setTimeout(r, 400))
  return {
    runId: `${id}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'queued' as const,
    message: `Workflow ${id} recibido con input: ${input?.slice(0, 80)}`
  }
}
