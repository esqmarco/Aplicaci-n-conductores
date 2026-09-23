// Gate de archivos críticos (PreToolUse sobre Edit|Write|MultiEdit) — Método de trabajo v8.
//
// No bloquea: si el archivo a editar está en metodo.json → archivosCriticos, agrega al
// contexto el recordatorio de metodo.json → mensajeCritico. En cualquier otro caso no emite nada.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

let entrada = ''
try { entrada = fs.readFileSync(0, 'utf8') } catch { process.exit(0) }

try {
    const cfg = JSON.parse(fs.readFileSync(path.join(raiz, '.claude', 'metodo.json'), 'utf8'))
    const criticos = cfg.archivosCriticos || []
    const ti = (JSON.parse(entrada || '{}').tool_input) || {}
    const archivo = ti.file_path || ti.notebook_path || ''
    if (!archivo || !criticos.length) process.exit(0)

    const rel = path.relative(raiz, path.resolve(raiz, archivo)).split(path.sep).join('/')
    if (criticos.includes(rel)) {
        const msg = `GATE ARCHIVO CRÍTICO (${rel}). ${cfg.mensajeCritico || 'Cambio sensible: verificar con /verificar antes de commitear.'}`
        process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: msg } }))
    }
} catch { /* un gate informativo nunca rompe la edición */ }
process.exit(0)
