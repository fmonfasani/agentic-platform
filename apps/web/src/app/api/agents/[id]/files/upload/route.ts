import { NextRequest, NextResponse } from 'next/server'

import { getApiBaseUrl } from '@/lib/api/config'



const API_BASE_URL = getApiBaseUrl()

export const dynamic = 'force-dynamic'

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

    return NextResponse.json(await response.json(), { status: response.status })

  } catch (error) {
    console.error('Error al subir archivo del agente:', error)
    return NextResponse.json(
      { message: 'No se pudo subir el archivo del agente' },
      { status: 500 }
    )
  }
}

function createTargetUrl(path: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
