import { GroqService } from "./src/features/case-builder/services/groq.service";

GroqService.generateChatMetadata(
  null,
  "I need help with a divorce case in Mumbai",
)
  .then((res) => console.log(JSON.stringify(res, null, 2)))
  .catch((err) => console.error(err));
