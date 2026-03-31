# AI Case Builder - Usage Guide

## Overview

The AI Case Builder is a conversational interface that helps users create comprehensive legal case files through natural dialogue. It uses AI to intelligently extract information while giving users full control over their data.

## Key Design Principles

### 1. **AI as Helper, Not Controller**

- User maintains full control at all times
- AI suggests and guides, never forces
- Easy editing and refinement of any information
- Preview and review before finalization

### 2. **Conversational, Not Form-Based**

- Natural dialogue flow
- One question at a time
- Context-aware follow-ups
- No overwhelming forms

### 3. **Smart Interrogation**

- AI asks targeted questions
- Connects dots between information
- Identifies gaps proactively
- Suggests specific examples

### 4. **Visual Elegance**

- Matches app's legal design language
- Smooth animations and transitions
- Clean, readable message display
- Interactive elements (chips, options)

## User Flow

### Stage 1: Welcome & Category Selection

```
AI: "What type of legal matter are you dealing with?"
Suggestions: [Property Dispute] [Employment Issue] [Family Matter] ...
```

### Stage 2: Basic Information

```
AI: "Can you briefly describe what happened?"
User: [Free text input]
```

### Stage 3: Parties Involved

```
AI: "Who are the parties involved in this case?"
AI: "Let's start with you. What's your full name and role?"
```

### Stage 4: Incident Details

```
AI: "When did this incident occur?"
AI: "Where did it happen?"
AI: "Can you walk me through what happened step by step?"
```

### Stage 5: Timeline Building

```
AI: "Let's create a timeline. What was the first significant event?"
[User provides event]
AI: "What happened next?"
```

### Stage 6: Evidence Collection

```
AI: "Do you have any evidence to support your case?"
Options: [Documents] [Photos] [Videos] [Witness Statements] [None yet]
```

### Stage 7: Witnesses

```
AI: "Are there any witnesses who can support your case?"
[If yes] "Tell me about the first witness..."
```

### Stage 8: Legal Issues

```
AI: "Based on what you've told me, here are potential legal issues..."
[AI suggests, user confirms/modifies]
```

### Stage 9: Desired Outcome

```
AI: "What outcome are you hoping for?"
Suggestions: [Compensation] [Contract Enforcement] [Injunction] ...
```

### Stage 10: Review & Finalize

```
[Preview mode shows all collected information]
User can edit any section
AI performs completeness check
Final confirmation before saving
```

## Interactive Elements

### Suggestion Chips

- Quick-select common responses
- Horizontal scrollable
- Tap to select and send
- Used for: categories, yes/no, common options

### Question Options (MCQs)

- Multiple choice selections
- Visual feedback on selection
- Single or multi-select
- Used for: objective questions, predefined choices

### Free Text Input

- Full flexibility for subjective responses
- Multiline support
- Character counter (optional)
- Used for: descriptions, narratives, open-ended questions

### Preview Mode

- Toggle anytime during conversation
- Shows all collected data
- Edit any field inline
- Visual indicators for missing data

## AI Behavior

### Question Strategy

1. **One at a time**: Never overwhelm with multiple questions
2. **Context-aware**: Follow-ups based on previous answers
3. **Specific examples**: "For example, was it a verbal or written agreement?"
4. **Validation**: "Just to confirm, you mentioned..."
5. **Gap identification**: "I notice you haven't mentioned..."

### Response Patterns

```typescript
// Acknowledgment + Follow-up
"Thank you for that information. Now, let's talk about...";

// Clarification
"I want to make sure I understand correctly. You said...";

// Encouragement
"That's helpful. Can you tell me more about...";

// Transition
"Great! Now that we have the timeline, let's discuss evidence...";

// Summary
"So far, we've covered... Next, I'd like to understand...";
```

### Error Handling

- Graceful API failures
- Retry mechanisms
- Fallback to manual input
- Clear error messages

## User Controls

### During Conversation

- **Send**: Submit current response
- **Preview**: View case summary anytime
- **Edit**: Modify any previous response
- **Skip**: Move to next question (if optional)

### In Preview Mode

- **Edit Field**: Tap any section to modify
- **Back to Chat**: Return to conversation
- **Finalize**: Complete and save case

### Final Actions

- **Save Draft**: Save for later completion
- **Finalize**: Mark as complete
- **Share**: Send to advocates
- **Export**: Download as PDF

## Best Practices

### For Users

1. Be specific and detailed in responses
2. Use suggestion chips when applicable
3. Review preview before finalizing
4. Add evidence and witnesses if available
5. Don't worry about legal terminology

### For Developers

1. Keep AI prompts focused and clear
2. Validate user input before processing
3. Handle API failures gracefully
4. Maintain conversation context
5. Test with various case types

## Customization

### Adding New Case Types

```typescript
// In groq.service.ts
const caseTypePrompts = {
  "property-dispute": "Focus on property details, boundaries, ownership...",
  employment: "Focus on employment terms, violations, timeline...",
  // Add more
};
```

### Modifying Question Flow

```typescript
// In useCaseBuilder.ts
const stageFlow: Record<BuilderStage, BuilderStage> = {
  welcome: "category",
  category: "basic-info",
  // Customize flow
};
```

### Styling Adjustments

```typescript
// All components use Tailwind classes
// Modify in individual component files
// Colors defined in tailwind.config.js
```

## Troubleshooting

### AI Not Responding

- Check Groq API key validity
- Verify network connection
- Check API rate limits
- Review error logs

### Messages Not Displaying

- Check conversation history state
- Verify message format
- Check ScrollView ref
- Review animation delays

### Input Not Working

- Check keyboard handling
- Verify TextInput props
- Check disabled states
- Review focus management

## Future Enhancements

1. **Voice Input**: Speech-to-text for responses
2. **Document OCR**: Extract text from uploaded documents
3. **Template Cases**: Pre-filled templates for common case types
4. **Advocate Matching**: AI suggests suitable advocates
5. **Real-time Collaboration**: Multiple users editing same case
6. **Case Strength Scoring**: AI evaluates case strength
7. **Legal Precedents**: AI suggests relevant case law
8. **Multi-language**: Support for regional languages
9. **Offline Mode**: Continue building without internet
10. **Auto-save**: Periodic automatic saving

## API Reference

### GroqService Methods

```typescript
// Send message to AI
GroqService.sendMessage(messages: GroqMessage[], temperature?: number): Promise<string>

// Generate follow-up question
GroqService.generateFollowUp(history: GroqMessage[], stage: string, caseData: any): Promise<string>

// Analyze case completeness
GroqService.analyzeCaseCompleteness(caseData: any): Promise<{
  isComplete: boolean;
  missingFields: string[];
  suggestions: string[];
}>

// Generate case summary
GroqService.generateCaseSummary(caseData: any): Promise<string>

// Suggest questions
GroqService.suggestQuestions(topic: string, context: string): Promise<string[]>
```

### useCaseBuilder Hook

```typescript
const {
  messages, // ConversationMessage[]
  caseData, // Partial<CaseData>
  currentStage, // BuilderStage
  isLoading, // boolean
  processUserResponse, // (input: string) => Promise<void>
  startConversation, // () => Promise<void>
  updateCaseData, // (updates: Partial<CaseData>) => void
  setCurrentStage, // (stage: BuilderStage) => void
  generateCaseSummary, // () => Promise<string>
  analyzeCompleteness, // () => Promise<ValidationResult>
  resetBuilder, // () => void
} = useCaseBuilder();
```

## Support

For issues or questions:

1. Check this documentation
2. Review component source code
3. Check console logs for errors
4. Test with different case types
5. Verify API configuration
