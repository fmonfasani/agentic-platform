'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Accordion } from '@/components/ui/Accordion'
import { cn } from '@/lib/utils'

const PURPOSE_OPTIONS = [
  {
    id: 'analysis',
    label: 'Análisis',
    description: 'Comprende datos y detecta patrones clave.',
    icon: '📊',
  },
  {
    id: 'informes',
    label: 'Informes',
    description: 'Genera resúmenes claros y accionables.',
    icon: '📄',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    description: 'Organiza información periódica sin esfuerzo.',
    icon: '📋',
  },
] as const

const TOOL_OPTIONS = [
  { id: 'code_interpreter', label: 'Code Interpreter' },
  { id: 'file_search', label: 'File Search' },
  { id: 'function_calling', label: 'Function Calling' },
] as const

const HERRAMIENTAS_OPTIONS = [
  { id: 'DIRECCION', label: 'DIRECCIÓN' },
  { id: 'SUBDIRECCION', label: 'SUBDIRECCIÓN' },
  { id: 'AREA', label: 'ÁREA' },
] as const

const PURPOSE_LABELS = PURPOSE_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {})

const TOOL_LABELS = TOOL_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {})

const HERRAMIENTA_LABELS = HERRAMIENTAS_OPTIONS.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {})

type VisualAgentConfig = {
  name: string
  model: string
  purpose: string[]
  tools: string[]
  herramientas: string[]
}

const formatList = (values: string[], labels: Record<string, string>) =>
  values.map((value) => labels[value] ?? value)

const buildSdkAgentPayload = ({ name, model, purpose, tools, herramientas }: VisualAgentConfig) => {
  const trimmedName = name.trim()
  const readablePurposes = formatList(purpose, PURPOSE_LABELS)
  const readableTools = formatList(tools, TOOL_LABELS)
  const readableHerramientas = formatList(herramientas, HERRAMIENTA_LABELS)

  const description = readablePurposes.length
    ? `Agente creado con el constructor visual enfocado en ${readablePurposes.join(', ')}.`
    : 'Agente creado con el constructor visual.'

  const instructionLines = [
    readablePurposes.length ? `Propósitos principales: ${readablePurposes.join(', ')}.` : null,
    readableTools.length ? `Herramientas habilitadas: ${readableTools.join(', ')}.` : null,
    readableHerramientas.length
      ? `Áreas responsables: ${readableHerramientas.join(', ')}.`
      : null,
  ].filter((line): line is string => Boolean(line))

  return {
    mode: 'sdk' as const,
    code: `export const agent = ${JSON.stringify(
      {
        name: trimmedName,
        model,
        purpose,
        tools,
        herramientas,
      },
      null,
      2
    )};`,
    metadata: {
      name: trimmedName,
      model,
      area: readableHerramientas[0] ?? 'Constructor Visual',
      description,
      instructions: instructionLines.length ? instructionLines.join('\n') : null,
    },
  }
}

type VisualAgentBuilderProps = {
  onCancel: () => void
  onSuccess: () => void
}

type FormErrors = Partial<Record<'name' | 'model' | 'purpose', string>>

export function VisualAgentBuilder({ onCancel, onSuccess }: VisualAgentBuilderProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [selectedPurpose, setSelectedPurpose] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedHerramientas, setSelectedHerramientas] = useState<string[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const togglePurpose = (id: string) => {
    setSelectedPurpose((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleTool = (id: string) => {
    setSelectedTools((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleHerramienta = (id: string) => {
    setSelectedHerramientas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!name.trim()) {
      nextErrors.name = 'El nombre es obligatorio.'
    } else if (name.trim().length < 3) {
      nextErrors.name = 'El nombre debe tener al menos 3 caracteres.'
    }

    if (!model) {
      nextErrors.model = 'Selecciona un modelo.'
    }

    if (selectedPurpose.length === 0) {
      nextErrors.purpose = 'Selecciona al menos un propósito.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResultMessage(null)
    setErrorMessage(null)

    if (!validate()) {
      return
    }

    try {
      setSubmitting(true)
      const payload = buildSdkAgentPayload({
        name,
        model,
        purpose: selectedPurpose,
        tools: selectedTools,
        herramientas: selectedHerramientas,
      })

      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        const message = typeof data?.message === 'string' ? data.message : 'No se pudo crear el agente'
        throw new Error(message)
      }

      setResultMessage(data?.message ?? 'Agente creado con éxito')

      setTimeout(() => {
        onSuccess()
        router.push('/agents')
      }, 1200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-emerald-400">✨ Crear Agente Visual</h2>
        <p className="mt-1 text-sm text-slate-400">
          Configurá tu agente seleccionando objetivos, modelo y herramientas disponibles.
        </p>
      </div>

      <div className="grid gap-5">
        <Input
          label="Nombre del Agente"
          placeholder="Ej. Analista Inteligente"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />

        <Select label="Modelo" value={model} onChange={(event) => setModel(event.target.value)} error={errors.model}>
          <option value="" disabled>
            Seleccioná un modelo
          </option>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4.1">gpt-4.1</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
          <option value="o4-mini">o4-mini</option>
        </Select>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-300">Propósito del Agente</p>
          <div className="flex flex-col gap-3 lg:flex-row">
            {PURPOSE_OPTIONS.map((option) => {
              const selected = selectedPurpose.includes(option.id)
              return (
                <Card
                  key={option.id}
                  hover
                  onClick={() => togglePurpose(option.id)}
                  className={cn(
                    'flex-1 border transition-all duration-200',
                    selected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-700 bg-slate-900/60'
                  )}
                >
                  <div className="flex flex-col gap-3">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">{option.label}</h3>
                      <p className="mt-1 text-sm text-slate-400">{option.description}</p>
                    </div>
                    <div
                      className={`mt-auto inline-flex w-max items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                        selected
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-slate-700/60 bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      {selected ? 'Seleccionado' : 'Seleccionar'}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          {errors.purpose && <p className="mt-2 text-xs text-red-400">{errors.purpose}</p>}
        </div>

        <Accordion title="Herramientas Disponibles" defaultOpen>
          <div className="space-y-3">
            {TOOL_OPTIONS.map((tool) => {
              const checked = selectedTools.includes(tool.id)
              return (
                <label
                  key={tool.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 transition-colors duration-200 hover:border-emerald-500/40"
                >
                  <span>{tool.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTool(tool.id)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              )
            })}
          </div>
        </Accordion>

        <Accordion title="Herramientas Disponibles (Organización)">
          <div className="space-y-3">
            {HERRAMIENTAS_OPTIONS.map((item) => {
              const checked = selectedHerramientas.includes(item.id)
              return (
                <label
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 transition-colors duration-200 hover:border-emerald-500/40"
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleHerramienta(item.id)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              )
            })}
          </div>
        </Accordion>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Crear Agente
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
          ❌ Error: <span className="font-medium text-red-100">{errorMessage}</span>
        </div>
      )}

      {resultMessage && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-100">
          ✅ {resultMessage}
        </div>
      )}
    </form>
  )
}
