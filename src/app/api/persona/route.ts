import { NextResponse } from 'next/server'
import { TAGS, placeById, type Tag } from '@/data/seed'

// SETUP.md Step 9 — the only server code in the app. No "use client".

export const runtime = 'nodejs'

type Candidate = {
  id: string
  title: string
  tags: string[]
  startOffset: number
  distanceKm: number
  price: string | null
}

type Body = { interests?: unknown; city?: unknown; candidates?: unknown }

const SYSTEM_PROMPT = [
  'You curate a shortlist of real local events for someone, in their voice.',
  'Return only JSON matching this schema:',
  '{"label": string, "sentence": string, "ranked": [{"eventId": string, "reason": string}]}',
  'Select only from the supplied event IDs. Never invent an event, time, price or place.',
  'Rank all candidates best-first. reason lines are one sentence, under 15 words.',
  'label is two or three words. sentence is one warm sentence about their taste.',
].join(' ')

function isTag(v: string): v is Tag {
  return (TAGS as readonly string[]).includes(v)
}

function localFallback(
  interests: Tag[],
  candidates: Candidate[],
): {
  label: string
  sentence: string
  ranked: { eventId: string; reason: string }[]
} {
  const ranked = [...candidates]
    .map((c) => {
      const overlap = c.tags.filter((t) => interests.includes(t as Tag)).length
      const soonness = c.startOffset < 0 ? -1000 : Math.max(0, 600 - c.startOffset) / 600
      return { c, score: overlap * 10 + soonness }
    })
    .sort((a, b) => b.score - a.score)
    .map(({ c }) => {
      const hit = c.tags.find((t) => interests.includes(t as Tag))
      const reason = hit
        ? `You said you're into ${hit.replace('-', ' ')}.`
        : 'Close by, and on tonight.'
      return { eventId: c.id, reason }
    })
  return {
    label: 'Curious',
    sentence: "Let's start with what's on tonight and see what sticks.",
    ranked,
  }
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const interests = Array.isArray(body.interests)
    ? body.interests.filter((t): t is Tag => typeof t === 'string' && isTag(t))
    : []
  const candidates = Array.isArray(body.candidates)
    ? (body.candidates as Candidate[]).filter(
        (c) => c && typeof c.id === 'string' && typeof c.title === 'string',
      )
    : []

  const fail = (why: string) => {
    console.warn(`/api/persona fallback: ${why}`)
    return NextResponse.json({ ...localFallback(interests, candidates), fallback: true })
  }

  const key = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL
  if (!key || !model || candidates.length === 0) {
    return fail(!key || !model ? 'no credentials' : 'no candidates')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: JSON.stringify({ interests, candidates }),
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
    const parsed = JSON.parse(content) as {
      label?: unknown
      sentence?: unknown
      ranked?: unknown
    }
    if (typeof parsed.label !== 'string' || typeof parsed.sentence !== 'string') {
      return fail('bad shape')
    }
    if (!Array.isArray(parsed.ranked) || parsed.ranked.length === 0) {
      return fail('no ranked')
    }
    const ids = new Set(candidates.map((c) => c.id))
    const ranked: { eventId: string; reason: string }[] = []
    for (const r of parsed.ranked) {
      const item = r as { eventId?: unknown; reason?: unknown }
      if (typeof item.eventId !== 'string' || !ids.has(item.eventId)) return fail('unknown eventId')
      if (typeof item.reason !== 'string' || item.reason.length === 0) return fail('bad reason')
      ids.delete(item.eventId)
      if (!ranked.some((x) => x.eventId === item.eventId)) {
        ranked.push({ eventId: item.eventId, reason: item.reason })
      }
    }
    for (const id of ids) {
      const place = placeById(id)
      ranked.push({ eventId: id, reason: place ? `Worth a look — ${place.area}.` : 'On tonight.' })
    }
    return NextResponse.json({
      label: parsed.label,
      sentence: parsed.sentence,
      ranked,
      fallback: false,
    })
  } catch (err) {
    return fail(err instanceof Error ? err.name : 'unknown error')
  } finally {
    clearTimeout(timer)
  }
}
