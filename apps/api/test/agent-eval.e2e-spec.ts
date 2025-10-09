import { Test, TestingModule } from '@nestjs/testing'
import { AgentEvalService } from '../src/agents/agent-eval.service'
import { PrismaService } from '../src/prisma/prisma.service'

jest.mock('openai', () => {
  const create = jest.fn()
  const retrieve = jest.fn()
  const constructor = jest.fn().mockImplementation(() => ({
    evals: {
      create,
      runs: { retrieve }
    }
  }))

  return {
    __esModule: true,
    default: constructor,
    __mock: { create, retrieve, constructor }
  }
})

const { __mock } = jest.requireMock('openai') as {
  __mock: {
    create: jest.Mock
    retrieve: jest.Mock
    constructor: jest.Mock
  }
}

const createMock = __mock.create
const retrieveMock = __mock.retrieve
const openAiConstructor = __mock.constructor

describe('AgentEvalService', () => {
  let service: AgentEvalService
  const prisma = {
    agentTrace: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  }

  let dateSpy: jest.SpyInstance

  beforeEach(async () => {
    jest.useFakeTimers()
    dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1_700_000_000_000)
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.OPENAI_EVAL_TEMPLATE = 'tmpl_123'
    process.env.OPENAI_EVAL_POLL_INTERVAL = '5'
    process.env.OPENAI_EVAL_TIMEOUT = '50'

    createMock.mockReset()
    retrieveMock.mockReset()
    openAiConstructor.mockClear()
    prisma.agentTrace.findUnique.mockReset()
    prisma.agentTrace.update.mockReset()

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: PrismaService, useValue: prisma }, AgentEvalService]
    }).compile()

    service = module.get(AgentEvalService)
  })

  afterEach(() => {
    jest.useRealTimers()
    dateSpy.mockRestore()
    delete process.env.OPENAI_API_KEY
    delete process.env.OPENAI_EVAL_TEMPLATE
    delete process.env.OPENAI_EVAL_POLL_INTERVAL
    delete process.env.OPENAI_EVAL_TIMEOUT
  })

  it('crea la evaluación y persiste grade/feedback/evaluator', async () => {
    prisma.agentTrace.findUnique.mockResolvedValue({
      id: 'trace-1',
      agentId: 'agent-1',
      input: 'Pregunta original',
      output: 'Respuesta final',
      agent: { id: 'agent-1', name: 'Analista ENACOM' }
    })

    createMock.mockResolvedValue({
      id: 'eval-1',
      run: { id: 'run-1', status: 'queued' }
    })

    retrieveMock
      .mockResolvedValueOnce({ id: 'run-1', status: 'running' })
      .mockResolvedValueOnce({
        id: 'run-1',
        status: 'completed',
        grade: 0.87,
        feedback: 'Muy buen resumen',
        evaluator: 'grader-enacom'
      })

    const promise = service.evaluateTrace('trace-1')

    await jest.advanceTimersByTimeAsync(5)
    await promise

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        evaluation_template_id: 'tmpl_123',
        inputs: [
          expect.objectContaining({
            input: 'Pregunta original',
            output: 'Respuesta final'
          })
        ]
      })
    )

    expect(prisma.agentTrace.update).toHaveBeenCalledWith({
      where: { id: 'trace-1' },
      data: {
        grade: 0.87,
        feedback: 'Muy buen resumen',
        evaluator: 'grader-enacom'
      }
    })

    await expect(promise).resolves.toEqual({
      grade: 0.87,
      feedback: 'Muy buen resumen',
      evaluator: 'grader-enacom'
    })
  })

  it('utiliza los resultados del grader cuando la respuesta final llega en el run', async () => {
    prisma.agentTrace.findUnique.mockResolvedValue({
      id: 'trace-2',
      agentId: 'agent-2',
      input: 'Consulta',
      output: 'Salida generada',
      agent: { id: 'agent-2', name: 'Evaluador' }
    })

    createMock.mockResolvedValue({
      id: 'eval-2',
      run: {
        id: 'run-2',
        status: 'completed',
        results: [
          {
            name: 'grader',
            score: 0.42,
            sample: {
              output: [{ content: 'Necesita más detalle' }]
            }
          }
        ]
      }
    })

    const result = await service.evaluateTrace('trace-2')

    expect(retrieveMock).not.toHaveBeenCalled()
    expect(prisma.agentTrace.update).toHaveBeenCalledWith({
      where: { id: 'trace-2' },
      data: {
        grade: 0.42,
        feedback: 'Necesita más detalle',
        evaluator: 'grader'
      }
    })

    expect(result).toEqual({
      grade: 0.42,
      feedback: 'Necesita más detalle',
      evaluator: 'grader'
    })
  })
})
