import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, MessageSquare, FileText, FileDown, Book, X, AlertCircle, Coins } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { SingleSelect } from './components/SingleSelect';
import { MultiSelect } from './components/MultiSelect';
import { GB, FR, ES, PT, RU, JP, CN, IN, SA, BD } from 'country-flag-icons/react/3x2';
import { generateContent } from './services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 32px;
  align-items: center;
`;

const NavLink = styled.a`
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  &:hover {
    color: #4361ee;
  }
`;

const Credits = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CreditCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
  font-weight: 500;
`;

const HelpButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  background: white;
  cursor: pointer;

  &:hover {
    border-color: #4361ee;
    color: #4361ee;
  }
`;

const UserAvatar = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background: ${props => props.$primary ? '#4361ee' : '#fff'};
  color: ${props => props.$primary ? '#fff' : '#4361ee'};
  border: 1px solid ${props => props.$primary ? '#4361ee' : '#e2e8f0'};

  &:hover {
    opacity: 0.9;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTitleWithActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const LanguageSelectWrapper = styled.div`
  width: 200px;
`;

interface OptionType {
  value: string;
  label: string;
  icon?: React.ReactElement;
}

const CONTENT_TYPES: OptionType[] = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Casual', label: 'Casual' },
  { value: 'Technical', label: 'Technical' }
];

const LANGUAGES: OptionType[] = [
  { value: 'English', label: 'English', icon: <GB style={{ width: 20, height: 15 }} /> },
  { value: 'MandarinChinese', label: 'Mandarin Chinese', icon: <CN style={{ width: 20, height: 15 }} /> },
  { value: 'Hindi', label: 'Hindi', icon: <IN style={{ width: 20, height: 15 }} /> },
  { value: 'Spanish', label: 'Spanish', icon: <ES style={{ width: 20, height: 15 }} /> },
  { value: 'French', label: 'French', icon: <FR style={{ width: 20, height: 15 }} /> },
  { value: 'Arabic', label: 'Arabic', icon: <SA style={{ width: 20, height: 15 }} /> },
  { value: 'Bengali', label: 'Bengali', icon: <BD style={{ width: 20, height: 15 }} /> },
  { value: 'Portuguese', label: 'Portuguese', icon: <PT style={{ width: 20, height: 15 }} /> },
  { value: 'Russian', label: 'Russian', icon: <RU style={{ width: 20, height: 15 }} /> },
  { value: 'Japanese', label: 'Japanese', icon: <JP style={{ width: 20, height: 15 }} /> }
];

const DropZone = styled.div<{ $isDragging?: boolean }>`
  border: 2px dashed ${props => props.$isDragging ? '#4361ee' : '#e2e8f0'};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4361ee;
  }
`;

const FilePreview = styled.div`
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ImageThumbnail = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
`;

const FileItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FileItem = styled.div`
  background: #f0f4ff;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  max-width: 300px;
  position: relative;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e53e3e;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${FileItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background: #c53030;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;

  &:focus {
    outline: none;
    border-color: #4361ee;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #4361ee;
  }
`;

const GeneratedContent = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
`;

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
`;

const WarningBanner = styled.div`
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  line-height: 1.5;

  svg {
    color: #92400e;
    margin-top: 2px;
  }
`;

const ChangedField = styled.span`
  color: #dc2626;
  font-weight: 600;
  display: inline-block;
`;

const IconButton = styled.button`
  padding: 4px;
  border: none;
  cursor: pointer;
  color: #4a5568;

  &:hover {
    color: #4361ee;
  }
`;

const ErrorTooltip = styled.div`
  position: absolute;
  right: -6px;
  top: -33px;
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  color: #e53e3e;
  cursor: help;
  background-color: white;

  &:hover span {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipText = styled.span`
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  right: 0;
  background-color: #1a202c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 1000;
  margin-bottom: 8px;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    right: 6px;
    border-width: 4px;
    border-style: solid;
    border-color: #1a202c transparent transparent transparent;
  }
`;

const ErrorMessage = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
  overflow: hidden;
`;

const Modal = styled.div<{ $position: { top: number; left: number } }>`
  position: fixed;
  top: ${props => props.$position.top}px;
  left: ${props => props.$position.left}px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  pointer-events: auto;

  &::before {
    content: '';
    position: absolute;
    right: -6px;
    top: 24px;
    width: 12px;
    height: 12px;
    background: white;
    transform: rotate(45deg);
    box-shadow: 2px -2px 3px rgba(0, 0, 0, 0.05);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  color: #1a202c;
  margin: 0;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const ModalContent = styled.div`
  margin: 12px 0;
`;

const ModalDescription = styled.p`
  color: #4a5568;
  margin-bottom: 12px;
  line-height: 1.5;
  font-size: 14px;
`;

const ContentActions = styled.div<{ $visible: boolean }>`
  display: ${props => props.$visible ? 'flex' : 'none'};
  gap: 8px;
`;

// Add new interfaces for generation state
interface GeneratedContent {
  [language: string]: {
    productDescription: string;
    technicalSpecs: string;
    marketingHighlights: string;
  };
}

interface GenerationState extends FormFields {
  timestamp: number;
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

function App() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormFields>({
    defaultValues: {
      productImages: [],
      productName: '',
      technicalDocs: [],
      additionalInfo: '',
      contentType: 'Professional',
      brandVoice: '',
      targetAudience: '',
      selectedLanguages: [],
    }
  });

  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isDraggingDocs, setIsDraggingDocs] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerationState, setLastGenerationState] = useState<GenerationState | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<'productDescription' | 'technicalSpecs' | 'marketingHighlights' | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const productImages = watch('productImages');
  const technicalDocs = watch('technicalDocs');
  const selectedLanguages = watch('selectedLanguages');

  // Update selected language when selected languages change
  useEffect(() => {
    if (!selectedLanguages.includes(selectedLanguage)) {
      setSelectedLanguage(selectedLanguages[0] || 'English');
    }
  }, [selectedLanguages, selectedLanguage]);

  const handleDragOver = (e: React.DragEvent, setDragging: (value: boolean) => void) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragging: (value: boolean) => void) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const existingFiles = watch('productImages');
      setValue('productImages', [...existingFiles, ...newFiles]);
      // Reset the input value to allow re-uploading the same file
      e.target.value = '';
    }
  }, [setValue, watch]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files);
    const existingFiles = watch('productImages');
    setValue('productImages', [...existingFiles, ...newFiles]);

    setIsDraggingImages(false);
    // Reset the corresponding input value
    const input = document.getElementById('productImages') as HTMLInputElement;
    if (input) input.value = '';
  }, [setValue, watch]);

  const handleDeleteFile = useCallback((type: 'productImages' | 'technicalDocs', index: number) => {
    const files = watch(type);
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setValue(type, newFiles);
  }, [setValue, watch]);

  const generateMutation = useMutation({
    mutationFn: async (data: FormFields) => {
      setIsGenerating(true);
      const stream = await generateContent(data);
      const newContent: GeneratedContent = {};

      try {
        for await (const chunk of stream) {
          const { type, content, language } = chunk;

          if (!newContent[language]) {
            newContent[language] = {
              productDescription: '',
              technicalSpecs: '',
              marketingHighlights: '',
            };
          }

          newContent[language][type] = content;
          setGeneratedContent({ ...newContent });
        }
      } catch (error) {
        console.error('Error during content generation:', error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
  });

  const getChangedFields = (currentValues: FormFields): string[] => {
    if (!lastGenerationState) return [];

    const changedFields: string[] = [];
    const compareFields: (keyof FormFields)[] = [
      'productName',
      'additionalInfo',
      'contentType',
      'brandVoice',
      'targetAudience'
    ];

    // Compare simple fields
    compareFields.forEach(field => {
      if (currentValues[field] !== lastGenerationState[field]) {
        changedFields.push(field);
      }
    });

    // Compare files
    if (currentValues.productImages.length !== lastGenerationState.productImages.length ||
        currentValues.productImages.some((file, i) => file.name !== lastGenerationState.productImages[i]?.name)) {
      changedFields.push('productImages');
    }

    if (currentValues.technicalDocs.length !== lastGenerationState.technicalDocs.length ||
        currentValues.technicalDocs.some((file, i) => file.name !== lastGenerationState.technicalDocs[i]?.name)) {
      changedFields.push('technicalDocs');
    }

    // Compare arrays
    if (JSON.stringify(currentValues.selectedLanguages) !== JSON.stringify(lastGenerationState.selectedLanguages)) {
      changedFields.push('selectedLanguages');
    }

    return changedFields;
  };

  const formatFieldName = (field: string): string => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Docs', 'Documents')
      .replace('Images', 'Images');
  };

  const onSubmit = handleSubmit((data) => {
    console.log('data', data);
    generateMutation.mutate(data);
    setLastGenerationState({
      ...data,
      timestamp: Date.now()
    });
  });

  useEffect(() => {
    // Cleanup object URLs when component unmounts or files change
    return () => {
      productImages.forEach(file => {
        if (typeof file === 'object') {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [productImages]);

  // Get current form values for comparison
  const currentValues = watch();
  const changedFields = getChangedFields(currentValues);

  const handleFeedbackSubmit = async () => {
    if (feedbackText.length <= 5) {
      setFeedbackError('Feedback must be longer than 5 characters');
      return;
    }

    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', {
      contentType: selectedContentType,
      language: selectedLanguage,
      feedback: feedbackText
    });

    // Close modal and reset state
    setFeedbackModalOpen(false);
    setFeedbackText('');
    setFeedbackError('');

    // Trigger regeneration for the specific content type
    if (selectedContentType) {
      await regenerateContent(selectedContentType);
    }
  };

  const regenerateContent = async (contentType: 'productDescription' | 'technicalSpecs' | 'marketingHighlights') => {
    if (!lastGenerationState) return;

    setIsGenerating(true);
    try {
      const stream = await generateContent(lastGenerationState);
      const newContent = { ...generatedContent };

      for await (const chunk of stream) {
        if (chunk.type === contentType) {
          if (!newContent[chunk.language]) {
            newContent[chunk.language] = {
              productDescription: generatedContent[chunk.language]?.productDescription || '',
              technicalSpecs: generatedContent[chunk.language]?.technicalSpecs || '',
              marketingHighlights: generatedContent[chunk.language]?.marketingHighlights || '',
            };
          }
          newContent[chunk.language][contentType] = chunk.content;
          setGeneratedContent({ ...newContent });
        }
      }
    } catch (error) {
      console.error('Error during content regeneration:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateClick = (contentType: 'productDescription' | 'technicalSpecs' | 'marketingHighlights', event: React.MouseEvent) => {
    // Calculate position relative to the clicked button
    const button = event.currentTarget;
    const modalWidth = 400; // Same as the width in styled component
    const textareaRect = button.closest('.generated-content')?.querySelector('textarea')?.getBoundingClientRect();

    if (!textareaRect) return;

    // Position the modal to the left of the textarea
    setModalPosition({
      top: textareaRect.top, // Align with the top of the textarea
      left: Math.max(20, textareaRect.left - modalWidth - 20), // Position to the left of the textarea
    });

    setSelectedContentType(contentType);
    setFeedbackModalOpen(true);
  };

  // Add scroll handler to update modal position
  useEffect(() => {
    if (!feedbackModalOpen) return;

    const handleScroll = () => {
      const contentType = selectedContentType;
      if (!contentType) return;

      const textarea = document.querySelector(`.generated-content-${contentType} textarea`);
      if (!textarea) return;

      const rect = textarea.getBoundingClientRect();
      const modalWidth = 400;

      setModalPosition({
        top: rect.top,
        left: Math.max(20, rect.left - modalWidth - 20),
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [feedbackModalOpen, selectedContentType]);

  return (
    <form onSubmit={onSubmit}>
      <Container>
        <Header>
          <Logo>
            <Book size={24} />
            ProductAI
          </Logo>
          <Nav>
            <NavLink href="#">Dashboard</NavLink>
            <NavLink href="#">History</NavLink>
            <NavLink href="#">Templates</NavLink>
          </Nav>
          <Credits>
            <CreditCounter>
              <Coins size={16} />
              <span>Credits: 245</span>
            </CreditCounter>
            <Button type="button">Buy More</Button>
            <HelpButton type="button" title="Help">
              <AlertCircle size={16} />
            </HelpButton>
            <UserAvatar type="button">
              <img src="https://ui-avatars.com/api/?name=User&background=4361ee&color=fff" alt="User" />
            </UserAvatar>
          </Credits>
        </Header>

        <MainGrid>
          <div>
            <Section>
              <SectionTitle>Upload Product Images <span style={{ color: '#718096' }}>(required)</span></SectionTitle>
              <Controller
                name="productImages"
                control={control}
                rules={{ required: 'At least one product image is required' }}
                render={({ field: { ref } }) => (
                  <>
                    <DropZone
                      $isDragging={isDraggingImages}
                      onDragOver={(e) => handleDragOver(e, setIsDraggingImages)}
                      onDragLeave={(e) => handleDragLeave(e, setIsDraggingImages)}
                      onDrop={(e) => handleFileDrop(e)}
                      onClick={() => document.getElementById('productImages')?.click()}
                    >
                      <Upload size={32} color="#4361ee" style={{ margin: '0 auto 16px' }} />
                      <p>Drag and drop your images here</p>
                      <p style={{ color: '#718096', margin: '8px 0' }}>or</p>
                      <Button type="button">Browse Files</Button>
                      <input
                        id="productImages"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileInput(e)}
                        ref={ref}
                        style={{ display: 'none' }}
                      />
                    </DropZone>
                    {errors.productImages && (
                      <ErrorMessage>
                        <ErrorTooltip>
                          <AlertCircle size={16} />
                          <TooltipText>{errors.productImages.message}</TooltipText>
                        </ErrorTooltip>
                      </ErrorMessage>
                    )}
                  </>
                )}
              />
              <FilePreview>
                {productImages.map((file, index) => (
                  <FileItem key={index}>
                    <ImageThumbnail
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                    />
                    <FileItemContent>
                      <FileText size={16} />
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px'
                      }}>
                        {file.name}
                      </span>
                    </FileItemContent>
                    <DeleteButton
                      type="button"
                      onClick={() => handleDeleteFile('productImages', index)}
                      title="Remove file"
                    >
                      <X size={12} />
                    </DeleteButton>
                  </FileItem>
                ))}
              </FilePreview>
            </Section>

            <Section>
              <SectionTitle>Product Name <span style={{ color: '#718096' }}>(required)</span></SectionTitle>
              <Controller
                name="productName"
                control={control}
                rules={{ required: 'Product name is required' }}
                render={({ field }) => (
                  <>
                    <Input
                      type="text"
                      placeholder="Enter product name"
                      {...field}
                    />
                    {errors.productName && (
                      <ErrorMessage>
                        <ErrorTooltip>
                          <AlertCircle size={16} />
                          <TooltipText>{errors.productName.message}</TooltipText>
                        </ErrorTooltip>
                      </ErrorMessage>
                    )}
                  </>
                )}
              />
            </Section>

            <Section>
              <SectionTitle>Documentation <span style={{ color: '#718096' }}>(required)</span></SectionTitle>
              <Controller
                name="technicalDocs"
                control={control}
                rules={{ required: 'At least one technical document is required' }}
                render={({ field: { ref } }) => (
                  <>
                    <DropZone
                      $isDragging={isDraggingDocs}
                      onDragOver={(e) => handleDragOver(e, setIsDraggingDocs)}
                      onDragLeave={(e) => handleDragLeave(e, setIsDraggingDocs)}
                      onDrop={(e) => handleFileDrop(e)}
                      onClick={() => document.getElementById('technicalDocs')?.click()}
                    >
                      <FileText size={32} color="#4361ee" style={{ margin: '0 auto 16px' }} />
                      <p>Upload PDF, DOCX, or TXT files</p>
                      <input
                        id="technicalDocs"
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => handleFileInput(e)}
                        ref={ref}
                        style={{ display: 'none' }}
                      />
                    </DropZone>
                    {errors.technicalDocs && (
                      <ErrorMessage>
                        <ErrorTooltip>
                          <AlertCircle size={16} />
                          <TooltipText>{errors.technicalDocs.message}</TooltipText>
                        </ErrorTooltip>
                      </ErrorMessage>
                    )}
                  </>
                )}
              />
              <FilePreview>
                {technicalDocs.map((file, index) => (
                  <FileItem key={index}>
                    <FileText size={16} />
                    {file.name}
                    <DeleteButton
                      type="button"
                      onClick={() => handleDeleteFile('technicalDocs', index)}
                      title="Remove file"
                    >
                      <X size={12} />
                    </DeleteButton>
                  </FileItem>
                ))}
              </FilePreview>
            </Section>

            <Section>
              <SectionTitle>Additional Information</SectionTitle>
              <Controller
                name="additionalInfo"
                control={control}
                render={({ field }) => (
                  <TextArea
                    placeholder="Enter any additional details about your product..."
                    {...field}
                  />
                )}
              />
            </Section>
          </div>

          <div>
            <Section>
              <SectionTitle>Generation Options</SectionTitle>
              <Controller
                name="contentType"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <SingleSelect
                    value={value}
                    onChange={onChange}
                    options={CONTENT_TYPES}
                    placeholder="Select content tone"
                  />
                )}
              />

              <Controller
                name="brandVoice"
                control={control}
                render={({ field }) => (
                  <TextArea
                    placeholder="Describe your brand's voice and communication style..."
                    {...field}
                  />
                )}
              />

              <Controller
                name="targetAudience"
                control={control}
                render={({ field }) => (
                  <TextArea
                    placeholder="Describe your target audience and their characteristics..."
                    {...field}
                  />
                )}
              />

              <Controller
                name="selectedLanguages"
                control={control}
                rules={{ validate: (value) => value.length > 0 || 'At least one language must be selected' }}
                render={({ field: { value, onChange } }) => (
                  <>
                    <MultiSelect
                      value={value}
                      onChange={onChange}
                      options={LANGUAGES}
                      placeholder="Select languages (at least one is required)"
                    />
                    {errors.selectedLanguages && (
                      <ErrorMessage>
                        <ErrorTooltip>
                          <AlertCircle size={16} />
                          <TooltipText>{errors.selectedLanguages.message}</TooltipText>
                        </ErrorTooltip>
                      </ErrorMessage>
                    )}
                  </>
                )}
              />

              <Button type="submit" $primary style={{ width: '100%' }} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Button>
            </Section>

            <Section>
              <SectionTitleWithActions>
                <TitleGroup style={{ justifyContent: 'space-between' }}>
                  <SectionTitle>Generated Content</SectionTitle>
                  {Object.keys(generatedContent).length > 0 && (
                    <LanguageSelectWrapper>
                      <SingleSelect
                        value={selectedLanguage}
                        onChange={setSelectedLanguage}
                        options={LANGUAGES.filter(lang => Object.keys(generatedContent).includes(lang.value))}
                        compact
                        placeholder="Select language"
                      />
                    </LanguageSelectWrapper>
                  )}
                </TitleGroup>
              </SectionTitleWithActions>

              {changedFields.length > 0 && lastGenerationState && (
                <WarningBanner>
                  <AlertCircle size={16} />
                  <div>
                    The following fields have changed since the last generation:
                    {changedFields.map((field, index) => (
                      <React.Fragment key={field}>
                        {' '}
                        <ChangedField>{formatFieldName(field)}</ChangedField>
                        {index < changedFields.length - 1 ? ',' : ''}
                      </React.Fragment>
                    ))}
                  </div>
                </WarningBanner>
              )}

              <GeneratedContent className={`generated-content generated-content-productDescription`}>
                <ContentHeader>
                  <h3>Product Description</h3>
                  <ContentActions $visible={!isGenerating && !!generatedContent[selectedLanguage]?.productDescription}>
                    <IconButton type="button" onClick={(e) => handleRegenerateClick('productDescription', e)} title="Provide feedback and regenerate">
                      <MessageSquare size={18} />
                    </IconButton>
                    <IconButton type="button">
                      <FileDown size={18} />
                    </IconButton>
                  </ContentActions>
                </ContentHeader>
                <TextArea
                  readOnly
                  value={generatedContent[selectedLanguage]?.productDescription || ''}
                  placeholder={isGenerating ? 'Generating content...' : 'Content will appear here...'}
                />
              </GeneratedContent>

              <GeneratedContent className={`generated-content generated-content-technicalSpecs`}>
                <ContentHeader>
                  <h3>Technical Specifications</h3>
                  <ContentActions $visible={!isGenerating && !!generatedContent[selectedLanguage]?.technicalSpecs}>
                    <IconButton type="button" onClick={(e) => handleRegenerateClick('technicalSpecs', e)} title="Provide feedback and regenerate">
                      <MessageSquare size={18} />
                    </IconButton>
                    <IconButton type="button">
                      <FileDown size={18} />
                    </IconButton>
                  </ContentActions>
                </ContentHeader>
                <TextArea
                  readOnly
                  value={generatedContent[selectedLanguage]?.technicalSpecs || ''}
                  placeholder={isGenerating ? 'Generating content...' : 'Content will appear here...'}
                />
              </GeneratedContent>

              <GeneratedContent className={`generated-content generated-content-marketingHighlights`}>
                <ContentHeader>
                  <h3>Marketing Highlights</h3>
                  <ContentActions $visible={!isGenerating && !!generatedContent[selectedLanguage]?.marketingHighlights}>
                    <IconButton type="button" onClick={(e) => handleRegenerateClick('marketingHighlights', e)} title="Provide feedback and regenerate">
                      <MessageSquare size={18} />
                    </IconButton>
                    <IconButton type="button">
                      <FileDown size={18} />
                    </IconButton>
                  </ContentActions>
                </ContentHeader>
                <TextArea
                  readOnly
                  value={generatedContent[selectedLanguage]?.marketingHighlights || ''}
                  placeholder={isGenerating ? 'Generating content...' : 'Content will appear here...'}
                />
              </GeneratedContent>
            </Section>
          </div>
        </MainGrid>
      </Container>

      {feedbackModalOpen && (
        <ModalOverlay>
          <Modal $position={modalPosition}>
            <ModalHeader>
              <ModalTitle>Regenerate {formatFieldName(selectedContentType || '')}</ModalTitle>
              <IconButton onClick={() => setFeedbackModalOpen(false)}>
                <X size={16} />
              </IconButton>
            </ModalHeader>
            <ModalContent>
              <ModalDescription>
                How would you like to improve this content?
              </ModalDescription>
              <TextArea
                placeholder="Example: Make it more technical, focus on the product's innovative features, use simpler language..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={{ minHeight: '100px' }}
              />
              {feedbackError && (
                <ErrorMessage>
                  <ErrorTooltip>
                    <AlertCircle size={16} />
                    <TooltipText>{feedbackError}</TooltipText>
                  </ErrorTooltip>
                </ErrorMessage>
              )}
            </ModalContent>
            <ModalFooter>
              <Button type="button" onClick={() => setFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleFeedbackSubmit} $primary>
                Regenerate
              </Button>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </form>
  );
}

export default App;
