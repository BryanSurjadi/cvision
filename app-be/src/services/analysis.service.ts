import { openai } from '../config/openai'
import { analysisRepository } from '../repositories/analysis.repository'
import { ExperienceLevel } from '@prisma/client'

interface AnalysisOutput {
  ats_score: number
  overall_summary: string
  experience_level: ExperienceLevel
  extracted_skills: string[]
  extracted_experience: any[]
  extracted_education: any[]
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}

const validExperienceLevels = ['fresh_graduate', 'junior', 'mid', 'senior']

export const analysisService = {
  analyze: async (submissionId: string, targetRole: string, cvText: string) => {
    const truncatedCv = cvText.slice(0, 15000)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS system and HR analyst.
            Rules:
            - Return valid JSON only
            - ats_score must be integer 0-100
            - experience_level must be one of: fresh_graduate, junior, mid, senior
            - Score based on: skills relevance (40%), work experience (30%), education (15%), CV clarity (15%)

            Return this exact JSON structure:
            {
              "ats_score": <integer 0-100>,
              "overall_summary": "<2-3 sentences about candidate fit>",
              "experience_level": "<fresh_graduate|junior|mid|senior>",
              "extracted_skills": ["skill1", "skill2"],
              "extracted_experience": [
                {
                  "company": "string",
                  "role": "string",
                  "duration": "string",
                  "highlights": ["string"]
                }
              ],
              "extracted_education": [
                {
                  "institution": "string",
                  "degree": "string",
                  "year": "string",
                  "gpa": "string or null"
                }
              ],
              "strengths": ["string"],
              "weaknesses": ["string"],
              "recommendation": "<brief note for admin and HR>"
            }`
        },
        {
          role: 'user',
          content: `Target Role: ${targetRole}\n\nCV:\n${truncatedCv}`
        }
      ]
    })

    const raw = response.choices[0].message.content || ''

    let parsed: AnalysisOutput
    try {
      parsed = JSON.parse(raw)
    } catch (err) {
      throw new Error(`Failed to parse AI response: ${raw}`)
    }

    if (typeof parsed.ats_score !== 'number' || parsed.ats_score < 0 || parsed.ats_score > 100) {
      throw new Error('Invalid ATS score returned from AI')
    }

    if (!validExperienceLevels.includes(parsed.experience_level)) {
      parsed.experience_level = 'junior' as ExperienceLevel
    }

    const result = await analysisRepository.create({
      submissionId,
      atsScore: parsed.ats_score,
      overallSummary: parsed.overall_summary,
      experienceLevel: parsed.experience_level,
      extractedSkills: parsed.extracted_skills,
      extractedExperience: parsed.extracted_experience,
      extractedEducation: parsed.extracted_education,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      recommendation: parsed.recommendation
    })

    return result
  }
}