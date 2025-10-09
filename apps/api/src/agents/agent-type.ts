export enum AgentType {
  Default = 'default',
}

export type AgentLike = {
  category?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function inferAgentType(agent?: AgentLike | null): AgentType {
  if (!agent) {
    return AgentType.Default;
  }

  const category = agent.category ?? (agent.metadata?.category as string | undefined);

  if (category && typeof category === 'string') {
    const normalized = category.toLowerCase();
    if ((Object.values(AgentType) as string[]).includes(normalized)) {
      return normalized as AgentType;
    }
  }

  return AgentType.Default;
}
