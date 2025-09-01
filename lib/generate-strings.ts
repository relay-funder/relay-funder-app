import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import { LoremIpsum } from 'lorem-ipsum';

export function uniqueName(): string {
  const uniqueNamesConfig = {
    dictionaries: [adjectives, colors, animals],
    separator: ' ',
  };
  return uniqueNamesGenerator(uniqueNamesConfig);
}
export function uniqueDescription(): string {
  const lorem = new LoremIpsum({
    sentencesPerParagraph: {
      max: 8,
      min: 4,
    },
    wordsPerSentence: {
      max: 16,
      min: 4,
    },
  });
  return lorem.generateParagraphs(Math.floor(Math.random() * 10 + 2));
}
