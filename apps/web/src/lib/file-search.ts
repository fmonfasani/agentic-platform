export const SUPPORTED_FILE_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.py': 'text/x-python',
  '.js': 'text/javascript',
  '.ts': 'application/typescript',
  '.c': 'text/x-c',
  '.cpp': 'text/x-c++',
  '.cs': 'text/x-csharp',
  '.css': 'text/css',
  '.go': 'text/x-golang',
  '.html': 'text/html',
  '.java': 'text/x-java',
  '.php': 'text/x-php',
  '.rb': 'text/x-ruby',
  '.sh': 'application/x-sh',
  '.tex': 'text/x-tex'
}

export const MAX_FILE_SIZE = 512 * 1024 * 1024 // 512MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Archivo muy grande (máx. 512MB)' }
  }

  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  if (!SUPPORTED_FILE_TYPES[ext]) {
    return { valid: false, error: 'Tipo de archivo no soportado' }
  }

  return { valid: true }
}
