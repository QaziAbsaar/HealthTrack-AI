import { OCRResult } from '../types';

// Google Vision API configuration
const GOOGLE_VISION_API_KEY = 'YOUR_GOOGLE_VISION_API_KEY'; // Replace with your actual API key
const GOOGLE_VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

class OCRService {
  
  /**
   * Extract text from an image using Google Vision OCR API
   */
  async extractTextFromImage(imageUri: string): Promise<OCRResult> {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1,
              },
            ],
          },
        ],
      };

      const response = await fetch(GOOGLE_VISION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.responses && result.responses[0] && result.responses[0].textAnnotations) {
        const textAnnotations = result.responses[0].textAnnotations;
        const fullText = textAnnotations[0]?.description || '';
        
        // Extract bounding boxes for better text positioning
        const boundingBoxes = textAnnotations.slice(1).map((annotation: any) => ({
          x: annotation.boundingPoly.vertices[0].x || 0,
          y: annotation.boundingPoly.vertices[0].y || 0,
          width: (annotation.boundingPoly.vertices[2].x || 0) - (annotation.boundingPoly.vertices[0].x || 0),
          height: (annotation.boundingPoly.vertices[2].y || 0) - (annotation.boundingPoly.vertices[0].y || 0),
          text: annotation.description,
        }));

        return {
          text: fullText,
          confidence: this.calculateConfidence(textAnnotations),
          boundingBoxes,
        };
      } else {
        // Return empty result if no text detected
        return {
          text: '',
          confidence: 0,
          boundingBoxes: [],
        };
      }
    } catch (error) {
      console.error('OCR extraction error:', error);
      
      // Fallback: return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockOCRResult();
      }
      
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Convert image URI to base64 string
   */
  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64 = base64data.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Calculate confidence score from text annotations
   */
  private calculateConfidence(textAnnotations: any[]): number {
    if (!textAnnotations || textAnnotations.length === 0) {
      return 0;
    }

    // Google Vision doesn't always provide confidence scores
    // We'll estimate based on the number of detected text elements
    const detectedTexts = textAnnotations.length - 1; // Exclude the full text annotation
    const maxConfidence = 0.95;
    const minConfidence = 0.1;
    
    if (detectedTexts > 50) return maxConfidence;
    if (detectedTexts < 5) return minConfidence;
    
    // Linear interpolation between min and max confidence
    return minConfidence + ((detectedTexts - 5) / 45) * (maxConfidence - minConfidence);
  }

  /**
   * Get mock OCR result for development/testing
   */
  private getMockOCRResult(): OCRResult {
    const mockTexts = [
      `LABORATORY REPORT
Patient Name: John Doe
Date: ${new Date().toLocaleDateString()}
Test Results:
- Glucose: 95 mg/dL (Normal: 70-100)
- Hemoglobin: 14.2 g/dL (Normal: 12-16)
- Cholesterol: 180 mg/dL (Normal: <200)
- White Blood Cells: 7,500/μL (Normal: 4,000-11,000)
- Red Blood Cells: 4.8 million/μL (Normal: 4.2-5.4)
Doctor: Dr. Smith
Clinic: City Medical Center`,

      `PRESCRIPTION
Patient: Jane Smith
Date: ${new Date().toLocaleDateString()}
Medications:
1. Metformin 500mg - Take twice daily with meals
2. Lisinopril 10mg - Take once daily in morning
3. Atorvastatin 20mg - Take once daily at bedtime
Follow-up: 3 months
Dr. Johnson
Internal Medicine`,

      `X-RAY REPORT
Patient: Mike Wilson
Exam Date: ${new Date().toLocaleDateString()}
Examination: Chest X-Ray
Findings:
- Lungs are clear bilaterally
- Heart size is normal
- No acute abnormalities
- Bones appear intact
Impression: Normal chest X-ray
Radiologist: Dr. Brown`,
    ];

    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    return {
      text: randomText,
      confidence: 0.85 + Math.random() * 0.1, // Random confidence between 0.85-0.95
      boundingBoxes: [], // Mock bounding boxes could be added here
    };
  }

  /**
   * Validate extracted text for medical content
   */
  validateMedicalText(text: string): {
    isValid: boolean;
    confidence: number;
    suggestions: string[];
  } {
    const medicalKeywords = [
      'patient', 'doctor', 'test', 'result', 'blood', 'glucose', 'hemoglobin',
      'cholesterol', 'pressure', 'medication', 'prescription', 'diagnosis',
      'laboratory', 'clinic', 'hospital', 'mg/dl', 'mmol/l', 'normal', 'abnormal'
    ];

    const textLower = text.toLowerCase();
    const foundKeywords = medicalKeywords.filter(keyword => 
      textLower.includes(keyword)
    );

    const confidence = foundKeywords.length / medicalKeywords.length;
    const isValid = confidence > 0.1; // At least 10% medical keywords

    const suggestions: string[] = [];
    if (confidence < 0.3) {
      suggestions.push('This may not be a medical document. Please verify the image quality.');
    }
    if (!textLower.includes('patient') && !textLower.includes('name')) {
      suggestions.push('Patient name may be missing or unclear.');
    }
    if (!textLower.includes('date')) {
      suggestions.push('Date information may be missing.');
    }

    return {
      isValid,
      confidence,
      suggestions,
    };
  }

  /**
   * Clean and format extracted text
   */
  cleanExtractedText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .replace(/[^\w\s\n\-.,:()/]/g, '') // Remove special characters except common punctuation
      .trim();
  }
}

export default new OCRService();
