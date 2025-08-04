import { Slide } from '@/../../types';

interface PlayerResponse {
  player_name: string;
  slide_id: number;
  selected_option: string;
}

type ScoreMap = Record<string, number>;

export function calculateScores(slides: Slide[], responses: PlayerResponse[]): ScoreMap {
  const scores: ScoreMap = {};

  for (const response of responses) {
    const { player_name, slide_id, selected_option } = response;
    const slide = slides.find((s) => s.id === slide_id);
    if (!slide) continue;

    const questionType = slide.questionType;

    if (!scores[player_name]) {
      scores[player_name] = 0;
    }

    try {
      if (questionType === 'multiple_choice') {
        const correctIndex = slide.answer as string;
        const playerIndex = selected_option;
        if (playerIndex === correctIndex) {
          scores[player_name] += 1;
        }
      }

      else if (questionType === 'checkbox') {
        const correctIndices = slide.answer as number[];
        const playerIndices = JSON.parse(selected_option) as number[];

        const correctSet = new Set(correctIndices);
        for (const idx of playerIndices) {
          if (correctSet.has(idx)) {
            scores[player_name] += 1;
          } else {
            scores[player_name] -= 1;
          }
        }
      }

      else if (questionType === 'scale') {
        const correctOrder = slide.answer as number[];
        const playerOrder = JSON.parse(selected_option) as number[];

        correctOrder.forEach((correctValue, index) => {
          if (playerOrder[index] === correctValue) {
            scores[player_name] += 1;
          }
        });
      }
    } catch (err) {
      console.warn(`Failed to parse response for ${player_name} on slide ${slide_id}`, err);
    }
  }

  return scores;
}
