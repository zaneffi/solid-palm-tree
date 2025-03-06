import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000';

export interface StreamingResponse {
  type: 'productDescription' | 'technicalSpecs' | 'marketingHighlights';
  content: string;
  language: string;
  isComplete: boolean;
}

export interface FormFields {
  productImages: File[];
  productName: string;
  technicalDocs: File[];
  additionalInfo: string;
  contentType: string;
  brandVoice: string;
  targetAudience: string;
  selectedLanguages: string[];
}

export const generateContent = async (formFields: FormFields): Promise<AsyncGenerator<StreamingResponse>> => {
  // First, upload the files
  const formData = new FormData();
  formFields.productImages.forEach((file) => {
    formData.append('productImages', file);
  });
  formFields.technicalDocs.forEach((file) => {
    formData.append('technicalDocs', file);
  });

  // Append other form fields
  formData.append('productName', formFields.productName);
  formData.append('additionalInfo', formFields.additionalInfo);
  formData.append('contentType', formFields.contentType);
  formData.append('brandVoice', formFields.brandVoice);
  formData.append('targetAudience', formFields.targetAudience);
  formData.append('selectedLanguages', JSON.stringify(formFields.selectedLanguages));

  // Upload files first
  await axios.post(`${BACKEND_URL}/content/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Then create SSE generator
  return createStreamingGenerator();
};

function createStreamingGenerator(): AsyncGenerator<StreamingResponse> {
  const eventSource = new EventSource(`${BACKEND_URL}/content/generate/${Date.now()}`);

  const generator = {
    async next(): Promise<IteratorResult<StreamingResponse>> {
      return new Promise((resolve) => {
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'complete') {
            eventSource.close();
            resolve({ value: undefined, done: true });
          } else if (data.type === 'error') {
            console.error('SSE error:', data.message);
            eventSource.close();
            resolve({ value: undefined, done: true });
          } else {
            resolve({ value: data, done: false });
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          eventSource.close();
          resolve({ value: undefined, done: true });
        };
      });
    },

    async return(): Promise<IteratorResult<StreamingResponse>> {
      eventSource.close();
      return { value: undefined, done: true };
    },

    async throw(error: Error): Promise<IteratorResult<StreamingResponse>> {
      eventSource.close();
      throw error;
    },

    [Symbol.asyncIterator]() {
      return this;
    },
  };

  return generator;
}
