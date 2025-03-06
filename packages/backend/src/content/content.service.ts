import { Injectable } from '@nestjs/common';

export interface StreamingResponse {
  type: 'productDescription' | 'technicalSpecs' | 'marketingHighlights';
  content: string;
  language: string;
  isComplete: boolean;
}

export interface FormFields {
  productImages: Express.Multer.File[];
  productName: string;
  technicalDocs: Express.Multer.File[];
  additionalInfo: string;
  contentType: string;
  brandVoice: string;
  targetAudience: string;
  selectedLanguages: string[];
}

@Injectable()
export class ContentService {
  private currentFormFields: FormFields | null = null;

  storeFormFields(formFields: FormFields) {
    this.currentFormFields = formFields;
  }

  getFormFields(): FormFields | null {
    return this.currentFormFields;
  }

  private mockContent = {
    productDescription: {
      English:
        'Experience the future of smart living with our revolutionary product...',
      MandarinChinese: '体验未来智能生活，我们的革命性产品...',
      Hindi: 'हमारे विशेष उत्पाद के साथ आगे की जीवन शैली में अनुभव करें...',
      Spanish:
        'Experimente el futuro de la vida inteligente con nuestro producto revolucionario...',
      French:
        'Découvrez le futur de la vie intelligente avec notre produit révolutionnaire...',
    },
    technicalSpecs: {
      English:
        '- Advanced AI Processing\n- 5nm Architecture\n- 16GB RAM\n- Neural Engine',
      MandarinChinese: '- 高级AI处理\n- 5nm架构\n- 16GB RAM\n- 神经引擎',
      Hindi: '- उन्नत AI प्रक्रिया\n- 5nm संरचना\n- 16GB RAM\n- न्यूरल इंजन',
      Spanish:
        '- Procesamiento AI Avanzado\n- Arquitectura 5nm\n- 16GB RAM\n- Motor Neural',
      French:
        '- Traitement IA Avancé\n- Architecture 5nm\n- 16GB RAM\n- Moteur Neuronal',
    },
    marketingHighlights: {
      English:
        '🚀 Revolutionary Performance\n💡 Intelligent Adaptation\n🌟 Seamless Integration',
      MandarinChinese: '🚀 革命性性能\n💡 智能适应\n🌟 无缝集成',
      Hindi: '🚀 विशेष प्रदर्शन\n💡 बुद्धिमान अनुकूलन\n🌟 समग्र इंटीग्रेशन',
      Spanish:
        '🚀 Rendimiento Revolucionario\n💡 Adaptación Inteligente\n🌟 Integración Perfecta',
      French:
        '🚀 Performance Révolutionnaire\n💡 Adaptation Intelligente\n🌟 Intégration Parfaite',
    },
  };

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async *generateContent(
    formFields: FormFields,
  ): AsyncGenerator<StreamingResponse> {
    for (const language of formFields.selectedLanguages) {
      // Stream product description
      const descWords =
        this.mockContent.productDescription[language]?.split(' ') || [];
      let currentDesc = '';
      for (const word of descWords) {
        currentDesc += word + ' ';
        yield {
          type: 'productDescription',
          content: currentDesc.trim(),
          language,
          isComplete: false,
        };
        await this.delay(100);
      }
      yield {
        type: 'productDescription',
        content: currentDesc.trim(),
        language,
        isComplete: true,
      };

      // Stream technical specs
      const techLines =
        this.mockContent.technicalSpecs[language]?.split('\n') || [];
      let currentTech = '';
      for (const line of techLines) {
        currentTech += line + '\n';
        yield {
          type: 'technicalSpecs',
          content: currentTech.trim(),
          language,
          isComplete: false,
        };
        await this.delay(150);
      }
      yield {
        type: 'technicalSpecs',
        content: currentTech.trim(),
        language,
        isComplete: true,
      };

      // Stream marketing highlights
      const marketingLines =
        this.mockContent.marketingHighlights[language]?.split('\n') || [];
      let currentMarketing = '';
      for (const line of marketingLines) {
        currentMarketing += line + '\n';
        yield {
          type: 'marketingHighlights',
          content: currentMarketing.trim(),
          language,
          isComplete: false,
        };
        await this.delay(200);
      }
      yield {
        type: 'marketingHighlights',
        content: currentMarketing.trim(),
        language,
        isComplete: true,
      };
    }
  }
}
