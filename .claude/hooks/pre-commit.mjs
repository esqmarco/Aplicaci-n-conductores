// Guardarraíl de commits — Método de trabajo v8. Lo llama .githooks/pre-commit.
//
// 1. Si el commit toca código (metodo.json → codigo, regex), corre metodo.json → testCommand.
// 2. Si toca un archivo crítico, exige que el mismo commit actualice el changelog.
// Saltarlo con --no-verify está prohibido por el método: si frena, se arregla la causa.

import fs from 'node:fs'
import path from 'node:path'
import { execSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const cfg = JSON.parse(fs.readFileSync(path.join(raiz, '.claude', 'metodo.json'), 'utf8'))

const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { cwd: raiz, encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean)

const reCodigo = new RegExp(cfg.codigo || '\\.(js|mjs|ts|jsx|tsx|py|html)$')
const tocaCodigo = staged.some(f => reCodigo.test(f))

if (tocaCodigo && cfg.testCommand) {
    const r = spawnSync(cfg.testCommand, { cwd: raiz, shell: true, encoding: 'utf8' })
    if (r.status !== 0) {
        const salida = String((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => !/\bPASS\b/.test(l))
        console.error(`[pre-commit] Los tests fallan (${cfg.testCommand}). Commit rechazado.\n` + salida.slice(-25).join('\n'))
        process.exit(1)
    }
}

const criticos = (cfg.archivosCriticos || []).filter(f => staged.includes(f))
const changelog = cfg.docs && cfg.docs.changelog
if (criticos.length && changelog && !staged.includes(changelog)) {
    console.error(`[pre-commit] Cambió ${criticos.join(', ')} sin entrada en ${changelog}. Documentar el cambio en el mismo commit.`)
    process.exit(1)
}

process.exit(0)
