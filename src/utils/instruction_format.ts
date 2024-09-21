export const formatInstructions = (instructions: string) => {
  return instructions.replace(/(\n|\n\r|\r)+/g, "\n\n");
}
