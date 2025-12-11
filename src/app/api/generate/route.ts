import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { parseAIResponse, generateLUTFromDescription, defaultParams, presets, generateCubeLUT, type LUTParams } from '@/lib/lut-generator'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are a professional colorist AI assistant specialized in creating color grading LUTs (Look-Up Tables).

When given a description of a desired look or mood, you must output specific numeric color grading parameters.

ALWAYS output parameters in this exact format:
- contrast: [value between -1 and 1, where 0 is neutral]
- saturation: [value between -1 and 1, where 0 is neutral]
- temperature: [value between -1 and 1, negative is cool/blue, positive is warm/orange]
- tint: [value between -1 and 1, negative is green, positive is magenta]
- shadows: [value between -1 and 1, affects dark areas]
- highlights: [value between -1 and 1, affects bright areas]
- lift: RGB([r], [g], [b]) - affects shadows, values between -1 and 1
- gamma: RGB([r], [g], [b]) - affects midtones, values between -1 and 1
- gain: RGB([r], [g], [b]) - affects highlights, values between -1 and 1

Examples:
- "Cinematic orange and teal" → contrast: 0.15, saturation: 0.1, temperature: 0.2, tint: 0.05, shadows: -0.1, highlights: 0.1, lift: RGB(0, -0.1, 0.1), gamma: RGB(0.05, 0, -0.05), gain: RGB(0.1, 0.05, -0.1)
- "Vintage film look" → contrast: 0.1, saturation: -0.15, temperature: 0.1, shadows: 0.1, highlights: -0.1, lift: RGB(0.1, 0.05, 0), gamma: RGB(0, 0, 0), gain: RGB(-0.05, -0.05, -0.1)
- "High contrast black and white" → saturation: -1, contrast: 0.3, shadows: -0.1, highlights: 0.1

Be creative but precise. Always provide all parameters needed to achieve the described look.`

export async function POST(request: NextRequest) {
  try {
    const { prompt, preset, manualParams } = await request.json()

    // If manual params provided, use them directly
    if (manualParams) {
      const params: LUTParams = { ...defaultParams, ...manualParams }
      const lutContent = generateCubeLUT(params, `Manual LUT - ${new Date().toISOString().split('T')[0]}`)
      return NextResponse.json({ 
        success: true, 
        lutContent,
        params,
        description: 'Custom manual parameters'
      })
    }

    // If preset is specified, use preset parameters
    if (preset && presets[preset]) {
      const params = presets[preset]
      const lutContent = generateCubeLUT(params, preset.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
      return NextResponse.json({ 
        success: true, 
        lutContent,
        params,
        description: `Preset: ${preset}`
      })
    }

    // Use AI to generate parameters
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'No prompt, preset, or parameters provided' 
      }, { status: 400 })
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      // Fallback: try to match prompt to closest preset
      const promptLower = prompt.toLowerCase()
      let matchedPreset: string | null = null
      
      if (promptLower.includes('cinematic') || promptLower.includes('teal') || promptLower.includes('orange')) {
        matchedPreset = 'cinematic-orange-teal'
      } else if (promptLower.includes('vintage') || promptLower.includes('film') || promptLower.includes('retro')) {
        matchedPreset = 'vintage-film'
      } else if (promptLower.includes('black') && promptLower.includes('white')) {
        matchedPreset = 'black-and-white'
      } else if (promptLower.includes('high contrast') || promptLower.includes('dramatic')) {
        matchedPreset = 'high-contrast'
      } else if (promptLower.includes('muted') || promptLower.includes('pastel') || promptLower.includes('soft')) {
        matchedPreset = 'muted-pastel'
      } else if (promptLower.includes('warm') || promptLower.includes('golden') || promptLower.includes('sunset')) {
        matchedPreset = 'warm-golden'
      } else if (promptLower.includes('cool') || promptLower.includes('blue') || promptLower.includes('cold')) {
        matchedPreset = 'cool-blue'
      } else if (promptLower.includes('vibrant') || promptLower.includes('pop') || promptLower.includes('saturated')) {
        matchedPreset = 'vibrant-pop'
      }

      if (matchedPreset) {
        const params = presets[matchedPreset]
        const lutContent = generateCubeLUT(params, prompt.slice(0, 50))
        return NextResponse.json({ 
          success: true, 
          lutContent,
          params,
          description: `Matched to preset: ${matchedPreset} (AI unavailable - add GROQ_API_KEY for custom generation)`
        })
      }

      // Default fallback
      const lutContent = generateCubeLUT(defaultParams, prompt.slice(0, 50))
      return NextResponse.json({ 
        success: true, 
        lutContent,
        params: defaultParams,
        description: 'Default neutral LUT (AI unavailable - add GROQ_API_KEY for custom generation)'
      })
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Create color grading parameters for: "${prompt}"` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''
    
    // Parse AI response to extract parameters
    const aiParams = parseAIResponse(aiResponse)
    const params: LUTParams = { ...defaultParams, ...aiParams }
    
    // Generate LUT content
    const title = prompt.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '')
    const lutContent = generateLUTFromDescription(params, title)

    return NextResponse.json({ 
      success: true, 
      lutContent,
      params,
      aiResponse,
      description: `AI-generated from: "${prompt}"`
    })

  } catch (error) {
    console.error('LUT generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate LUT' 
    }, { status: 500 })
  }
}
