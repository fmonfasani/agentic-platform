import { NextRequest, NextResponse } from 'next/server'

import { nextResponseFromFetch } from '../../../_utils'

const DEFAULT_API_URL = 'http://localhost:3001/api'

const API_BASE_URL =
  resolveApiBaseUrl(process.env.API_URL, process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_API_URL

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const vectorStoreId = formData.get('vector_store_id') as string | null

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Archivo inválido' }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append('file', file)
    if (vectorStoreId) {
      backendFormData.append('vector_store_id', vectorStoreId)
    }

    const response = await fetch(createTargetUrl(`/agents/${params.id}/files/upload`), {
      method: 'POST',
      body: backendFormData
    })

    return await nextResponseFromFetch(response)
  } catch (error) {
    console.error('Error al subir archivo del agente:', error)
    return NextResponse.json(
      { message: 'No se pudo subir el archivo del agente' },
      { status: 500 }
    )
  }
}

function resolveApiBaseUrl(...values: Array<string | undefined>) {
  for (const value of values) {
    const normalized = normalizeEnvValue(value)
    if (normalized) {
      return normalized
    }
  }
  return undefined
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined
  }
  return trimmed.replace(/\/$/, '')
}

function createTargetUrl(path: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
