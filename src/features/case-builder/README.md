# AI Case Builder

An intelligent, conversational case builder that helps users create comprehensive legal case files through natural dialogue.

## Features

### 🤖 AI-Powered Conversation

- Uses Groq's Llama 3.3 70B model for intelligent questioning
- Contextual follow-up questions based on user responses
- Connects dots between information to identify gaps
- Natural, empathetic conversation flow

### 💬 Conversational UI

- Clean, bubble-free message display with markdown support
- AI messages formatted beautifully without chat bubbles
- User messages in styled bubbles
- Smooth animations and transitions

### 🎯 Smart Interrogation

- Targeted questions to extract all relevant details
- Breaks complex topics into digestible parts
- Suggests specific examples to help users think
- Validates information and asks for clarification

### 🎨 Interactive Elements

- **Suggestion Chips**: Quick-select common responses
- **Question Options**: MCQ-style selections for objective questions
- **Free Text Input**: Full flexibility for subjective responses
- **Preview Mode**: Review and edit case details anytime

### ✏️ User Control

- Edit any field at any time
- Preview case summary during building
- Refine and alter AI-generated content
- Final cross-check before finalization

### 📋 Case Components

- Case category and description
- Parties involved (plaintiff/defendant)
- Timeline of events
- Evidence documentation
- Witness information
- Legal issues identification
- Desired outcome
- Urgency level

## Architecture

### Components

- `ConversationMessage`: Displays AI and user messages with markdown
- `SuggestionChips`: Horizontal scrollable quick-reply chips
- `QuestionOptions`: MCQ-style option selector
- `CaseBuilderInput`: Custom input with send button
- `CasePreviewCard`: Editable case summary view
- `TypingIndicator`: Animated AI thinking indicator

### Services

- `GroqService`: Handles all AI API calls
  - Message generation
  - Follow-up questions
  - Case completeness analysis
  - Summary generation

### Hooks

- `useCaseBuilder`: Main state management for conversation flow
  - Message history
  - Case data updates
  - AI interaction
  - Stage progression

### Types

- `CaseData`: Complete case structure
- `ConversationMessage`: Message format
- `BuilderStage`: Conversation stages
- `QuestionOption`: MCQ option format

## Usage

```typescript
import CaseBuilderScreen from '@/features/case-builder/screens/CaseBuilderScreen';

// In your navigation
<Stack.Screen name="create-case" component={CaseBuilderScreen} />
```

## Design Principles

1. **AI as Helper, Not Controller**: User has full control, AI assists
2. **No Form Feel**: Conversational, not form-based
3. **Progressive Disclosure**: Information revealed as needed
4. **Visual Consistency**: Matches app's legal design language
5. **Efficient Interrogation**: Extract maximum info with minimum friction

## API Integration

Uses Groq API with Llama 3.3 70B Versatile model:

- Fast response times
- High-quality natural language understanding
- Context-aware follow-ups
- JSON parsing for structured data

## Future Enhancements

- [ ] Voice input support
- [ ] Document attachment and OCR
- [ ] Template-based case types
- [ ] Advocate matching suggestions
- [ ] Real-time collaboration
- [ ] Case strength scoring
- [ ] Legal precedent suggestions
- [ ] Multi-language support
