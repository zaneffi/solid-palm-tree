interface StreamingResponse {
  type: 'productDescription' | 'technicalSpecs' | 'marketingHighlights';
  content: string;
  language: string;
  isComplete: boolean;
}

interface FormFields {
  productImages: File[];
  productName: string;
  technicalDocs: File[];
  additionalInfo: string;
  contentType: string;
  brandVoice: string;
  targetAudience: string;
  selectedLanguages: string[];
}

export const mockStreamingResponse = async function* (languages: string[]): AsyncGenerator<StreamingResponse> {
  const mockContent = {
    productDescription: {
      English: "Experience the future of smart living with our revolutionary product...",
      MandarinChinese: "体验未来智能生活，我们的革命性产品...",
      Hindi: "हमारे विशेष उत्पाद के साथ आगे की जीवन शैली में अनुभव करें...",
      Spanish: "Experimente el futuro de la vida inteligente con nuestro producto revolucionario...",
      French: "Découvrez le futur de la vie intelligente avec notre produit révolutionnaire...",
      Arabic: "استكشف المستقبل الذكي مع منتجنا المثير...",
      Bengali: "আমাদের বিশেষ পণ্যের সাথে আগের জীবন সিদ্ধান্ত নিন...",
      Portuguese: "Descubra o futuro da vida inteligente com nosso produto revolucionário...",
      Russian: "Исследуйте будущее интеллектуальной жизни с нашим революционным продуктом...",
      Japanese: "未来のスマートライフを体験してください。我々の革命的な製品で。"
    },
    technicalSpecs: {
      English: "- Advanced AI Processing\n- 5nm Architecture\n- 16GB RAM\n- Neural Engine",
      MandarinChinese: "- 高级AI处理\n- 5nm架构\n- 16GB RAM\n- 神经引擎",
      Hindi: "- उन्नत AI प्रक्रिया\n- 5nm संरचना\n- 16GB RAM\n- 神経 इंजिन",
      Spanish: "- Procesamiento AI Avanzado\n- Arquitectura 5nm\n- 16GB RAM\n- Motor Neural",
      French: "- Traitement IA Avancé\n- Architecture 5nm\n- 16GB RAM\n- Moteur Neuronal",
      Arabic: "- معالجة AI متقدمة\n- بنية 5nm\n- 16GB RAM\n- محرك نيورون",
      Bengali: "- উন্নত AI প্রক্রিয়া\n- 5nm সংরচনা\n- 16GB RAM\n- নিউরাল ইঞ্জিন",
      Portuguese: "- Processamento IA Avançado\n- Arquitetura 5nm\n- 16GB RAM\n- Motor Neural",
      Russian: "- Расширенная обработка AI\n- Архитектура 5nm\n- 16GB RAM\n- Нейронный двигатель",
      Japanese: "- 高度なAI処理\n- 5nmアーキテクチャ\n- 16GB RAM\n- ニューラルエンジン"
    },
    marketingHighlights: {
      English: "🚀 Revolutionary Performance\n💡 Intelligent Adaptation\n🌟 Seamless Integration",
      MandarinChinese: "🚀 革命性性能\n💡 智能适应\n🌟 无缝集成",
      Hindi: "🚀 विशेष प्रदर्शन\n💡 बुद्धिमान अनुकूलन\n🌟 समग्र इंटीग्रेशन",
      Spanish: "🚀 Rendimiento Revolucionario\n💡 Adaptación Inteligente\n🌟 Integración Perfecta",
      French: "🚀 Performance Révolutionnaire\n💡 Adaptation Intelligente\n🌟 Intégration Parfaite",
      Arabic: "🚀 أداء مثير\n💡 تكييف مع الذكاء\n🌟 تكامل مثالي",
      Bengali: "🚀 বিশেষ প্রদর্শন\n💡 বুদ্ধিমান অনুকূলন\n🌟 সমগ্র ইংটিগ্রেশন",
      Portuguese: "🚀 Desempenho Revolucionário\n💡 Adaptabilidade Inteligente\n🌟 Integração Perfeita",
      Russian: "🚀 Революционные характеристики\n💡 Интеллектуальное адаптирование\n🌟 Идеальное интегрирование",
      Japanese: "🚀 革命的性能\n💡 スマート適応\n🌟 スムーズ統合"
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const language of languages) {
    // Stream product description
    const descWords = mockContent.productDescription[language as keyof typeof mockContent.productDescription].split(' ');
    let currentDesc = '';
    for (const word of descWords) {
      currentDesc += word + ' ';
      yield {
        type: 'productDescription',
        content: currentDesc.trim(),
        language,
        isComplete: false
      };
      await delay(100);
    }
    yield {
      type: 'productDescription',
      content: currentDesc.trim(),
      language,
      isComplete: true
    };

    // Stream technical specs
    const techLines = mockContent.technicalSpecs[language as keyof typeof mockContent.technicalSpecs].split('\n');
    let currentTech = '';
    for (const line of techLines) {
      currentTech += line + '\n';
      yield {
        type: 'technicalSpecs',
        content: currentTech.trim(),
        language,
        isComplete: false
      };
      await delay(150);
    }
    yield {
      type: 'technicalSpecs',
      content: currentTech.trim(),
      language,
      isComplete: true
    };

    // Stream marketing highlights
    const marketingLines = mockContent.marketingHighlights[language as keyof typeof mockContent.marketingHighlights].split('\n');
    let currentMarketing = '';
    for (const line of marketingLines) {
      currentMarketing += line + '\n';
      yield {
        type: 'marketingHighlights',
        content: currentMarketing.trim(),
        language,
        isComplete: false
      };
      await delay(200);
    }
    yield {
      type: 'marketingHighlights',
      content: currentMarketing.trim(),
      language,
      isComplete: true
    };
  }
};

export const generateContent = async (formFields: FormFields): Promise<AsyncGenerator<StreamingResponse>> => {
  // In a real implementation, this would make an actual API call
  return mockStreamingResponse(formFields.selectedLanguages);
};
