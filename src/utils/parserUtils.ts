import { ParsedMedicalData, BloodTestResults, PrescriptionData, VitalsData, MedicalValue, Medication } from '../types/index';

class ParserUtils {

  /**
   * Parse extracted text and identify medical values
   */
  parseMedicalText(text: string, reportType?: string): ParsedMedicalData {
    const cleanText = this.cleanText(text);
    const parsedData: ParsedMedicalData = {};

    switch (reportType) {
      case 'blood_test':
      case 'laboratory':
        parsedData.bloodTest = this.parseBloodTestResults(cleanText);
        break;
      case 'prescription':
        parsedData.prescription = this.parsePrescriptionData(cleanText);
        break;
      default:
        // Try to parse all types
        parsedData.bloodTest = this.parseBloodTestResults(cleanText);
        parsedData.prescription = this.parsePrescriptionData(cleanText);
        parsedData.vitals = this.parseVitalsData(cleanText);
        break;
    }

    return parsedData;
  }

  /**
   * Parse blood test results from text
   */
  private parseBloodTestResults(text: string): BloodTestResults {
    const results: BloodTestResults = {};
    const textLower = text.toLowerCase();

    // Glucose patterns
    const glucoseMatch = this.extractValueWithUnit(textLower, ['glucose', 'blood glucose', 'fasting glucose'], ['mg/dl', 'mg/l', 'mmol/l']);
    if (glucoseMatch) {
      results.glucose = {
        ...glucoseMatch,
        normalRange: '70-100 mg/dL',
        status: this.getGlucoseStatus(glucoseMatch.value as number),
      };
    }

    // Hemoglobin patterns
    const hemoglobinMatch = this.extractValueWithUnit(textLower, ['hemoglobin', 'hgb', 'hb'], ['g/dl', 'g/l']);
    if (hemoglobinMatch) {
      results.hemoglobin = {
        ...hemoglobinMatch,
        normalRange: '12-16 g/dL',
        status: this.getHemoglobinStatus(hemoglobinMatch.value as number),
      };
    }

    // Cholesterol patterns
    const cholesterolMatch = this.extractValueWithUnit(textLower, ['cholesterol', 'total cholesterol'], ['mg/dl', 'mg/l', 'mmol/l']);
    if (cholesterolMatch) {
      results.cholesterol = {
        ...cholesterolMatch,
        normalRange: '<200 mg/dL',
        status: this.getCholesterolStatus(cholesterolMatch.value as number),
      };
    }

    // White Blood Cells
    const wbcMatch = this.extractValueWithUnit(textLower, ['white blood cells', 'wbc', 'leukocytes'], ['/μl', '/ul', 'k/ul', 'x10³/μl']);
    if (wbcMatch) {
      results.whiteBloodCells = {
        ...wbcMatch,
        normalRange: '4,000-11,000/μL',
        status: this.getWBCStatus(wbcMatch.value as number),
      };
    }

    // Red Blood Cells
    const rbcMatch = this.extractValueWithUnit(textLower, ['red blood cells', 'rbc', 'erythrocytes'], ['million/μl', 'm/ul', 'x10⁶/μl']);
    if (rbcMatch) {
      results.redBloodCells = {
        ...rbcMatch,
        normalRange: '4.2-5.4 million/μL',
        status: this.getRBCStatus(rbcMatch.value as number),
      };
    }

    // Platelets
    const plateletsMatch = this.extractValueWithUnit(textLower, ['platelets', 'plt'], ['/μl', '/ul', 'k/ul', 'x10³/μl']);
    if (plateletsMatch) {
      results.platelets = {
        ...plateletsMatch,
        normalRange: '150,000-450,000/μL',
        status: this.getPlateletsStatus(plateletsMatch.value as number),
      };
    }

    return results;
  }

  /**
   * Parse prescription data from text
   */
  private parsePrescriptionData(text: string): PrescriptionData {
    const medications: Medication[] = [];
    let doctor = '';
    let clinic = '';
    let instructions = '';

    // Extract doctor name
    const doctorPatterns = [
      /dr\.?\s+([a-z\s]+)/i,
      /doctor:?\s*([a-z\s]+)/i,
      /physician:?\s*([a-z\s]+)/i,
    ];
    
    for (const pattern of doctorPatterns) {
      const match = text.match(pattern);
      if (match) {
        doctor = match[1].trim();
        break;
      }
    }

    // Extract clinic/hospital
    const clinicPatterns = [
      /clinic:?\s*([a-z\s]+)/i,
      /hospital:?\s*([a-z\s]+)/i,
      /medical center:?\s*([a-z\s]+)/i,
    ];
    
    for (const pattern of clinicPatterns) {
      const match = text.match(pattern);
      if (match) {
        clinic = match[1].trim();
        break;
      }
    }

    // Extract medications
    const lines = text.split('\n');
    for (const line of lines) {
      const medication = this.parseMedicationLine(line);
      if (medication) {
        medications.push(medication);
      }
    }

    // Extract general instructions
    const instructionPatterns = [
      /instructions?:?\s*([^\n]+)/i,
      /directions?:?\s*([^\n]+)/i,
      /notes?:?\s*([^\n]+)/i,
    ];
    
    for (const pattern of instructionPatterns) {
      const match = text.match(pattern);
      if (match) {
        instructions = match[1].trim();
        break;
      }
    }

    return {
      medications,
      doctor,
      clinic,
      instructions,
    };
  }

  /**
   * Parse vitals data from text
   */
  private parseVitalsData(text: string): VitalsData {
    const vitals: VitalsData = {};
    const textLower = text.toLowerCase();

    // Blood pressure
    const bpPattern = /blood pressure:?\s*(\d+\/\d+)/i;
    const bpMatch = text.match(bpPattern);
    if (bpMatch) {
      vitals.bloodPressure = bpMatch[1];
    }

    // Heart rate
    const heartRateMatch = this.extractValueWithUnit(textLower, ['heart rate', 'pulse', 'hr'], ['bpm', 'beats/min']);
    if (heartRateMatch) {
      vitals.heartRate = {
        ...heartRateMatch,
        normalRange: '60-100 bpm',
        status: this.getHeartRateStatus(heartRateMatch.value as number),
      };
    }

    // Temperature
    const tempMatch = this.extractValueWithUnit(textLower, ['temperature', 'temp'], ['°f', '°c', 'f', 'c']);
    if (tempMatch) {
      vitals.temperature = {
        ...tempMatch,
        normalRange: '98.6°F (37°C)',
        status: this.getTemperatureStatus(tempMatch.value as number, tempMatch.unit),
      };
    }

    // Weight
    const weightMatch = this.extractValueWithUnit(textLower, ['weight', 'wt'], ['kg', 'lbs', 'lb', 'pounds']);
    if (weightMatch) {
      vitals.weight = weightMatch;
    }

    // Height
    const heightMatch = this.extractValueWithUnit(textLower, ['height', 'ht'], ['cm', 'in', 'inches', 'ft', 'feet']);
    if (heightMatch) {
      vitals.height = heightMatch;
    }

    return vitals;
  }

  /**
   * Extract value with unit from text
   */
  private extractValueWithUnit(text: string, terms: string[], units: string[]): MedicalValue | null {
    for (const term of terms) {
      for (const unit of units) {
        // Pattern: term: value unit or term value unit
        const patterns = [
          new RegExp(`${term}:?\\s*(\\d+(?:\\.\\d+)?)\\s*${unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
          new RegExp(`${term}\\s+(\\d+(?:\\.\\d+)?)\\s*${unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
        ];

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match) {
            return {
              value: parseFloat(match[1]),
              unit: unit,
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * Parse a single medication line
   */
  private parseMedicationLine(line: string): Medication | null {
    // Common medication patterns
    const patterns = [
      // 1. Medication Name 500mg - Take twice daily
      /^(\d+\.?\s*)?([a-z\s]+?)\s+(\d+\s*(?:mg|g|ml|mcg|μg|units?))\s*[-–]\s*(.+)$/i,
      // 2. Medication Name: 500mg, Take twice daily
      /^(\d+\.?\s*)?([a-z\s]+?):\s*(\d+\s*(?:mg|g|ml|mcg|μg|units?)),?\s*(.+)$/i,
      // 3. Simple: Medication Name 500mg twice daily
      /^(\d+\.?\s*)?([a-z\s]+?)\s+(\d+\s*(?:mg|g|ml|mcg|μg|units?))\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[2].trim();
        const dosage = match[3].trim();
        const instructionText = match[4].trim();

        // Extract frequency and duration from instructions
        const { frequency, duration, instructions } = this.parseInstructions(instructionText);

        // Validate medication name (should be at least 3 characters and not all numbers)
        if (name.length >= 3 && !/^\d+$/.test(name)) {
          return {
            name,
            dosage,
            frequency,
            duration,
            instructions,
          };
        }
      }
    }

    return null;
  }

  /**
   * Parse medication instructions to extract frequency and duration
   */
  private parseInstructions(text: string): { frequency: string; duration?: string; instructions: string } {
    const textLower = text.toLowerCase();
    let frequency = '';
    let duration = '';

    // Extract frequency
    const frequencyPatterns = [
      { pattern: /once\s+daily|daily|1x\s*daily|qd/i, value: 'Once daily' },
      { pattern: /twice\s+daily|2x\s*daily|bid/i, value: 'Twice daily' },
      { pattern: /three\s+times?\s+daily|3x\s*daily|tid/i, value: 'Three times daily' },
      { pattern: /four\s+times?\s+daily|4x\s*daily|qid/i, value: 'Four times daily' },
      { pattern: /every\s+(\d+)\s+hours?/i, value: 'Every $1 hours' },
      { pattern: /as\s+needed|prn/i, value: 'As needed' },
    ];

    for (const { pattern, value } of frequencyPatterns) {
      const match = textLower.match(pattern);
      if (match) {
        frequency = value.replace('$1', match[1] || '');
        break;
      }
    }

    // Extract duration
    const durationPatterns = [
      /for\s+(\d+)\s+days?/i,
      /for\s+(\d+)\s+weeks?/i,
      /for\s+(\d+)\s+months?/i,
      /(\d+)\s+days?/i,
      /(\d+)\s+weeks?/i,
      /(\d+)\s+months?/i,
    ];

    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        duration = match[0];
        break;
      }
    }

    return {
      frequency: frequency || 'As directed',
      duration,
      instructions: text,
    };
  }

  /**
   * Clean text for parsing
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[""'']/g, '"')
      .replace(/[–—]/g, '-')
      .trim();
  }

  // Status determination methods
  private getGlucoseStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 70) return value < 54 ? 'critical' : 'low';
    if (value > 100) return value > 180 ? 'critical' : 'high';
    return 'normal';
  }

  private getHemoglobinStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 12) return value < 8 ? 'critical' : 'low';
    if (value > 16) return value > 20 ? 'critical' : 'high';
    return 'normal';
  }

  private getCholesterolStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 200) return 'normal';
    if (value < 240) return 'high';
    return 'critical';
  }

  private getWBCStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 4000) return value < 2000 ? 'critical' : 'low';
    if (value > 11000) return value > 20000 ? 'critical' : 'high';
    return 'normal';
  }

  private getRBCStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 4.2) return value < 3.0 ? 'critical' : 'low';
    if (value > 5.4) return value > 6.5 ? 'critical' : 'high';
    return 'normal';
  }

  private getPlateletsStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 150000) return value < 50000 ? 'critical' : 'low';
    if (value > 450000) return value > 1000000 ? 'critical' : 'high';
    return 'normal';
  }

  private getHeartRateStatus(value: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < 60) return value < 40 ? 'critical' : 'low';
    if (value > 100) return value > 150 ? 'critical' : 'high';
    return 'normal';
  }

  private getTemperatureStatus(value: number, unit: string): 'normal' | 'high' | 'low' | 'critical' {
    // Convert to Fahrenheit for consistent comparison
    const fahrenheit = unit.toLowerCase().includes('c') ? (value * 9/5) + 32 : value;
    
    if (fahrenheit < 97) return fahrenheit < 95 ? 'critical' : 'low';
    if (fahrenheit > 100.4) return fahrenheit > 104 ? 'critical' : 'high';
    return 'normal';
  }
}

export default new ParserUtils();
