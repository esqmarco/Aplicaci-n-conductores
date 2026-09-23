// Arranque automático (SessionStart) — Método de trabajo v8.
//
// Se ejecuta al abrir la sesión y también después de cada compactación del contexto
// (Claude Code dispara SessionStart en startup, resume, clear y compact). Inyecta el
// ESTADO del proyecto, no las reglas: las reglas viven en CLAUDE.md, que se carga solo.
//
// Todo lo específico del proyecto se lee de .claude/metodo.json: este archivo es igual
// en todos los proyectos. Nunca rompe el arranque: cualquier error se reporta como texto.

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const LIMITE = 9000 // Claude Code recorta la salida de un hook a 10.000 caracteres

function leer(rel) {
    try { return fs.readFileSync(path.join(raiz, rel), 'utf8') } catch { return null }
}

function sh(cmd, timeout = 8000) {
    try {
        // trimEnd: git status --short usa la primera columna (un espacio es información)
        return { ok: true, out: execSync(cmd, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout }).trimEnd() }
    } catch (e) {
        return { ok: false, out: String((e.stdout || '') + (e.stderr || '')).trim() }
    }
}

let cfg = {}
try { cfg = JSON.parse(leer('.claude/metodo.json') || '{}') } catch (e) { cfg = { _error: e.message } }
const docs = cfg.docs || {}
const partes = []

partes.push(`MÉTODO DE TRABAJO v8 — arranque automático · ${cfg.proyecto || path.basename(raiz)}`)
if (cfg._error) partes.push(`Aviso: .claude/metodo.json no se pudo leer (${cfg._error}).`)

// --- git: lo que realmente pasó (si un doc contradice al git, manda el git) ---
const rama = sh('git rev-parse --abbrev-ref HEAD')
if (rama.ok) {
    const log = sh('git log --oneline -6')
    const sucio = sh('git status --short')
    const lineasSucio = sucio.ok && sucio.out ? sucio.out.split('\n') : []
    partes.push(`\n— GIT — rama ${rama.out}\n${log.out}`)
    partes.push(lineasSucio.length
        ? `Cambios sin commitear (${lineasSucio.length}):\n${lineasSucio.slice(0, 10).join('\n')}${lineasSucio.length > 10 ? '\n…' : ''}`
        : 'Árbol limpio.')

    // Guardarraíl de commits: se activa solo (si depende de acordarse, no está terminado)
    if (fs.existsSync(path.join(raiz, '.githooks', 'pre-commit'))) {
        const hp = sh('git config core.hooksPath')
        if (!hp.ok || hp.out !== '.githooks') {
            const set = sh('git config core.hooksPath .githooks')
            partes.push(set.ok ? 'Pre-commit activado ahora (core.hooksPath = .githooks).' : 'No se pudo activar el pre-commit: correr `git config core.hooksPath .githooks`.')
        }
    }
}

// --- estado actual: la sección "## Estado actual" del backlog (un dato, un dueño) ---
if (docs.plan) {
    const plan = leer(docs.plan)
    const m = plan && plan.match(/^##\s+Estado actual[^\n]*\n([\s\S]*?)(?=^##\s|(?![\s\S]))/m)
    partes.push(m
        ? `\n— ESTADO ACTUAL (${docs.plan}) —\n${m[1].trim()}`
        : `\n— ESTADO ACTUAL — no encontré "## Estado actual" en ${docs.plan}. Si falta, crearlo en el próximo /cierre.`)
}

// --- comandos disponibles, leídos de la carpeta (no de memoria) ---
const dirCmd = path.join(raiz, '.claude', 'commands')
try {
    const cmds = fs.readdirSync(dirCmd).filter(f => f.endsWith('.md')).map(f => {
        const txt = fs.readFileSync(path.join(dirCmd, f), 'utf8')
        const d = txt.match(/^description:\s*(.+)$/m)
        return `/${f.replace(/\.md$/, '')} — ${d ? d[1].trim().slice(0, 160) : ''}`
    })
    if (cmds.length) partes.push(`\n— COMANDOS (si la tarea tiene comando, se usa el comando) —\n${cmds.join('\n')}`)
} catch { /* sin carpeta de comandos */ }

// --- tests al arrancar: la línea de base se mide, no se supone ---
if (cfg.testCommand && cfg.testAlArrancar) {
    const t = sh(cfg.testCommand, 60000)
    const ultima = t.out.split('\n').filter(l => l.trim()).pop() || '(sin salida)'
    partes.push(`\n— TESTS (${cfg.testCommand}) — ${t.ok ? 'OK' : 'FALLAN'}: ${ultima}`)
}

let texto = partes.join('\n')
if (texto.length > LIMITE) {
    texto = `AVISO: la salida del arranque mide ${texto.length} caracteres y se recortó a ${LIMITE}. Achicar la sección "Estado actual" de ${docs.plan || 'el backlog'}.\n\n` + texto.slice(0, LIMITE)
}

process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: texto } }))
process.exit(0)
