import { HarmCategory, HarmBlockThreshold, SchemaType } from '@google/generative-ai';

export function getInstruction(language, description, thinking, thinkingCompatible) {
  const thinkingInstruction = thinking
    ? "\nThink deeply and reason as much as possible before returning the response."
    : "\nDo NOT think or reason.";

  let instruction = 
    `You are an assistant that translates subtitles from any language to ${language}.\n` +
    `You will receive a list of objects, each with two fields:\n\n` +
    `- index: a string identifier\n` +
    `- content: the subtitle text to translate\n\n` +
    `Translate ONLY the 'content' field of each object.\n` +
    `Keep line breaks, formatting, and special characters.\n` +
    `Do NOT move or merge 'content' between objects.\n` +
    `Do NOT add or remove any objects.\n` +
    `Do NOT make any changes to the 'index' field.`;

  if (thinkingCompatible) {
    instruction += thinkingInstruction;
  }

  if (description) {
    instruction += `\n\nAdditional user instruction:\n\n${description}`;
  }

  return instruction;
}

export function getSafetySettings() {
  return [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
}

export function getResponseSchema() {
  return {
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        index: {
          type: SchemaType.STRING,
        },
        content: {
          type: SchemaType.STRING,
        },
      },
      required: ["index", "content"],
    },
  };
}