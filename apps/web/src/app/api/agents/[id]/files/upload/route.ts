import { NextRequest, NextResponse } from 'next/server'
import { forwardToEnacom } from '@/lib/api'

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

    return forwardToEnacom(`/agents/${params.id}/files/upload`, {
      method: 'POST',
      body: backendFormData
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'No se pudo subir el archivo del agente' },
      { status: 500 }
    )
  }
}
