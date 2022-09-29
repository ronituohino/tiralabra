import { Button, Text } from "@chakra-ui/react";
import { AppState, Player } from "../utils/types";

export type EndGameProps = {
  gameEnded: boolean;
  winner?: Player;
  setAppState: (appState: AppState) => void;
};

export function EndGame({ gameEnded, winner, setAppState }: EndGameProps) {
  return (
    <>
      {gameEnded && (
        <>
          <Text>Game ended!</Text>

          {winner === undefined ? (
            <Text>The game is a tie!</Text>
          ) : (
            <Text>Winner is: {winner.name}</Text>
          )}

          <Button onClick={() => setAppState("config")}>Back to config</Button>
        </>
      )}
    </>
  );
}