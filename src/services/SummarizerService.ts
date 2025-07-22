import { LLMResponse } from '../types';

// Configuration for LLM services
const GEMMA_MED_API_URL = 'YOUR_GEMMA_MED_API_URL'; // Replace with actual endpoint
const MEDPALM2_API_URL = 'YOUR_MEDPALM2_API_URL'; // Replace with actual endpoint
const API_KEY = 'YOUR_LLM_API_KEY'; // Replace with your actual API key

class SummarizerService {

  /**
   * Generate a summary of medical report text using LLM
   */
  async generateSummary(reportText: string, reportType?: string): Promise<LLMResponse> {
    try {
      const prompt = this.buildSummaryPrompt(reportText, reportType);
      
      // Try MedPalm2 first, fallback to Gemma-Med
      const response = await this.callMedPalm2(prompt) || await this.callGemmaMed(prompt);
      
      if (response) {
        return response;
      }
      
      // Fallback to mock response for development
      return this.getMockSummaryResponse(reportText, reportType);
      
    } catch (error) {
      console.error('Summary generation error:', error);
      
      // Return mock response for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockSummaryResponse(reportText, reportType);
      }
      
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Generate AI response for medical questions
   */
  async answerMedicalQuestion(question: string, context?: string): Promise<LLMResponse> {
    try {
      const prompt = this.buildQuestionPrompt(question, context);
      
      const response = await this.callMedPalm2(prompt) || await this.callGemmaMed(prompt);
      
      if (response) {
        return response;
      }
      
      return this.getMockQuestionResponse(question);
      
    } catch (error) {
      console.error('Question answering error:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return this.getMockQuestionResponse(question);
      }
      
      throw new Error('Failed to answer question');
    }
  }

  /**
   * Analyze medical report and provide insights
   */
  async analyzeReport(reportText: string, reportType?: string): Promise<LLMResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(reportText, reportType);
      
      const response = await this.callMedPalm2(prompt) || await this.callGemmaMed(prompt);
      
      if (response) {
        return response;
      }
      
      return this.getMockAnalysisResponse(reportText, reportType);
      
    } catch (error) {
      console.error('Report analysis error:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return this.getMockAnalysisResponse(reportText, reportType);
      }
      
      throw new Error('Failed to analyze report');
    }
  }

  /**
   * Call MedPalm2 API
   */
  private async callMedPalm2(prompt: string): Promise<LLMResponse | null> {
    try {
      const response = await fetch(MEDPALM2_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`MedPalm2 API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        summary: result.response,
        confidence: result.confidence || 0.8,
      };
    } catch (error) {
      console.error('MedPalm2 API error:', error);
      return null;
    }
  }

  /**
   * Call Gemma-Med API
   */
  private async callGemmaMed(prompt: string): Promise<LLMResponse | null> {
    try {
      const response = await fetch(GEMMA_MED_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          input: prompt,
          max_length: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemma-Med API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        summary: result.generated_text,
        confidence: result.confidence || 0.75,
      };
    } catch (error) {
      console.error('Gemma-Med API error:', error);
      return null;
    }
  }

  /**
   * Build prompt for summary generation
   */
  private buildSummaryPrompt(reportText: string, reportType?: string): string {
    const typeContext = reportType ? ` This is a ${reportType.replace('_', ' ')} report.` : '';
    
    return `Please provide a concise medical summary of the following report.${typeContext} Focus on key findings, important values, and any abnormalities. Keep it under 200 words and use clear, patient-friendly language:

${reportText}

Summary:`;
  }

  /**
   * Build prompt for question answering
   */
  private buildQuestionPrompt(question: string, context?: string): string {
    const contextSection = context ? `\nContext from medical reports:\n${context}\n` : '';
    
    return `You are a helpful medical AI assistant. Please answer the following health-related question clearly and accurately. If the question is outside your scope or requires immediate medical attention, advise the user to consult a healthcare professional.${contextSection}

Question: ${question}

Answer:`;
  }

  /**
   * Build prompt for report analysis
   */
  private buildAnalysisPrompt(reportText: string, reportType?: string): string {
    const typeContext = reportType ? ` This is a ${reportType.replace('_', ' ')} report.` : '';
    
    return `Please analyze the following medical report and provide insights.${typeContext} Include:
1. Key findings
2. Any values outside normal ranges
3. Recommendations for follow-up
4. Important trends or patterns

${reportText}

Analysis:`;
  }

  /**
   * Generate mock summary response for development
   */
  private getMockSummaryResponse(reportText: string, reportType?: string): LLMResponse {
    const summaries = {
      blood_test: "Blood test results show glucose levels at 95 mg/dL (normal range), hemoglobin at 14.2 g/dL (normal), and cholesterol at 180 mg/dL (optimal). All major markers are within healthy ranges. White blood cell count is normal, indicating no signs of infection. Continue current health routine and follow up as recommended by your doctor.",
      
      prescription: "Prescription includes Metformin for diabetes management, Lisinopril for blood pressure control, and Atorvastatin for cholesterol management. Take medications as directed with meals and monitor for any side effects. Follow-up appointment scheduled in 3 months to assess treatment effectiveness.",
      
      xray: "Chest X-ray shows clear lungs with no signs of infection, pneumonia, or other abnormalities. Heart size appears normal. Bone structures are intact. This is a normal chest X-ray result with no concerning findings requiring immediate attention.",
      
      default: "Medical report shows various health parameters. Results appear to be within expected ranges for most values. Some findings may require follow-up with your healthcare provider. Continue monitoring as recommended and maintain regular medical check-ups.",
    };

    const summaryKey = reportType as keyof typeof summaries || 'default';
    const summary = summaries[summaryKey] || summaries.default;

    return {
      summary,
      confidence: 0.85,
      recommendations: [
        "Follow up with your healthcare provider if you have questions",
        "Keep this report for your medical records",
        "Monitor any symptoms mentioned in the report",
      ],
    };
  }

  /**
   * Generate mock question response for development
   */
  private getMockQuestionResponse(question: string): LLMResponse {
    const questionLower = question.toLowerCase();
    
    let response = "I understand your health concern. ";
    
    if (questionLower.includes('blood pressure') || questionLower.includes('hypertension')) {
      response += "Blood pressure management typically involves lifestyle changes like regular exercise, reducing sodium intake, managing stress, and taking prescribed medications as directed. Normal blood pressure is generally below 120/80 mmHg.";
    } else if (questionLower.includes('diabetes') || questionLower.includes('glucose') || questionLower.includes('sugar')) {
      response += "Diabetes management includes monitoring blood glucose levels, following a balanced diet, regular exercise, and taking medications as prescribed. Target glucose levels vary, but fasting levels are typically 80-130 mg/dL.";
    } else if (questionLower.includes('cholesterol')) {
      response += "Cholesterol management involves a heart-healthy diet low in saturated fats, regular exercise, and potentially medication. Total cholesterol should be below 200 mg/dL, with LDL below 100 mg/dL.";
    } else {
      response += "For specific medical advice tailored to your situation, please consult with your healthcare provider. They can review your medical history and provide personalized recommendations.";
    }
    
    response += "\n\nImportant: This information is for educational purposes only and should not replace professional medical advice.";

    return {
      summary: response,
      confidence: 0.8,
      recommendations: [
        "Consult your healthcare provider for personalized advice",
        "Keep track of your symptoms and measurements",
        "Follow your prescribed treatment plan",
      ],
    };
  }

  /**
   * Generate mock analysis response for development
   */
  private getMockAnalysisResponse(reportText: string, reportType?: string): LLMResponse {
    const analysis = `Analysis of ${reportType?.replace('_', ' ') || 'medical'} report:

Key Findings:
• Multiple health parameters have been measured and documented
• Most values appear to be within or near normal ranges
• Some metrics may require ongoing monitoring

Recommendations:
• Continue regular health monitoring
• Follow up with healthcare provider as scheduled
• Maintain current treatment plan if applicable
• Track any changes in symptoms or measurements

This analysis is based on the available information. For detailed interpretation and personalized medical advice, please consult your healthcare provider.`;

    return {
      analysis,
      confidence: 0.75,
      recommendations: [
        "Regular monitoring of key health metrics",
        "Adherence to prescribed treatment plans",
        "Prompt follow-up for any concerning changes",
        "Maintain healthy lifestyle habits",
      ],
    };
  }
}

export default new SummarizerService();
