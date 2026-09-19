import { NextResponse } from 'next/server'
import { INTEREST_CHIPS, type InterestTag } from '@/data/seed'

// The only server code in the app. No "use client".
//
// SCOPE: this writes PROSE and nothing else — the one line of the persona card that
// reads the person back to themselves. It does not rank, order or explain events.
// Discover order, deck order and every reason line are deterministic and local
// (src/data/rank.ts), and stay that way: they have been carrying the demo on their
// own and they cannot contradict the seed.

export const runtime = 'nodejs'

type Body = { interests?: unknown }

const CHIP_LABEL = new Map(INTEREST_CHIPS.map((c) => [c.tag, c.label.toLowerCase()]))

const SYSTEM_PROMPT = [
  'You read someone back to themselves in one line, from the interests they picked.',
  'Return only JSON: {"label": string, "sentence": string}.',
  'sentence is second person, warm, dry, under 14 words, and ends with a full stop.',
  'Example: "You\'re a bit of a runner and a foodie."',
  'label is two or three words naming the type of person, e.g. "Early riser".',
  'Name only the interests you are given. Never invent a place, time, number or event.',
].join(' ')

/**
 * Deterministic prose for when the model is slow, unreachable or unconfigured. The
 * persona card must never be blank and must never show an error — this is a demo
 * that gets driven on stage.
 */
function localPersona(interests: InterestTag[]): { label: string; sentence: string } {
  const labels = interests.map((t) => CHIP_LABEL.get(t) ?? t.replace('-', ' '))
  if (labels.length === 0) {
    return { label: 'Curious', sentence: "Let's start with what's on tonight and see what sticks." }
  }
  const first = labels.slice(0, 2)
  const list = first.length === 2 ? `${first[0]} and ${first[1]}` : first[0]
  return {
    label: 'Curious',
    sentence: `You're a bit of a ${list} person.`,
  }
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const valid = new Set(INTEREST_CHIPS.map((c) => c.tag as string))
  const interests = Array.isArray(body.interests)
    ? body.interests.filter((t): t is InterestTag => typeof t === 'string' && valid.has(t))
    : []

  const fail = (why: string) => {
    console.warn(`/api/persona fallback: ${why}`)
    return NextResponse.json({ ...localPersona(interests), fallback: true })
  }

  const key = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL
  if (!key || !model) return fail('no credentials')
  if (interests.length === 0) return fail('no interests')

  const controller = new AbortController()
  // Warm, this call lands in about two seconds. Cold — first request after a deploy,
  // lambda still starting — it has been measured just under six, which is exactly
  // when it matters most: the call fires once, during the live run-through. The
  // loading state is designed and already on screen, so waiting a few seconds longer
  // beats silently showing the deterministic copy on the one take that counts.
  const timer = setTimeout(() => controller.abort(), 9000)
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: 'json_object' },
        // Not decoration. Left at its default this model spends ~700 tokens thinking
        // about a one-line answer and takes ~20s — every call aborted below and the
        // card silently fell back. Capped, the same call lands in about two seconds.
        reasoning: { effort: 'minimal' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({
              interests: interests.map((t) => CHIP_LABEL.get(t) ?? t),
            }),
          },
        ],
      }),
      signal: controller.signal,
    })
    if (!res.ok) return fail(`openrouter ${res.status}`)
    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (!content) return fail('empty completion')

    const parsed = JSON.parse(content) as { label?: unknown; sentence?: unknown }
    // Reasoning at minimal effort occasionally drops a key — take the model's prose
    // only when it is actually there, and patch the rest from local.
    const local = localPersona(interests)
    const label =
      typeof parsed.label === 'string' && parsed.label.trim().length > 0
        ? parsed.label.trim()
        : local.label
    const sentence =
      typeof parsed.sentence === 'string' && parsed.sentence.trim().length > 0
        ? parsed.sentence.trim()
        : null
    if (!sentence) return fail('no sentence')

    return NextResponse.json({ label, sentence, fallback: false })
  } catch (err) {
    return fail(err instanceof Error ? err.name : 'unknown error')
  } finally {
    clearTimeout(timer)
  }
}
