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

export const analysisService = {
  analyze: async (submissionId: string, targetRole: string, cvText: string) => {
    const prompt = `Target Role: ${targetRole}\n
    
    CV Content: ${cvText}
    
    Analyze this cv for the target role desired and return only a valid JSON object with this exact structure:

    {
      "ats_score": <integer 0-100>,
      "overall_summary": "<2-3 sentences about candidate fit>",
      "experience_level": "<one of: fresh_graduate, junior, mid, senior>",
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

    const response = await openai.chat.completions.create({
      model: 'gpt-40-mini',
      max_tokens: 1500,
      messages: [{
        role: 'system',
        content: 'You are an expert ATS system and HR analyst. Return ONLY valid JSON — no preamble, no markdown, no extra text.'
        },
        { 
          role: 'user', 
          content: prompt 
        }],
    })

    const raw = response.choices[0].message.content || '';
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed: AnalysisOutput = JSON.parse(cleaned)

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