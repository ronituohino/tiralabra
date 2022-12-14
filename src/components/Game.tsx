import {
  AppState,
  ConfigSchema,
  BoardIndex,
  MoveTarget,
  Board,
  GameStateStatic,
  GameInfo,
} from "../types";
import { useEffect, useState } from "react";

import {
  getPossibleMovesFromTile,
  initializeGame,
  moveSheep,
  setSheep,
  getPossibleMoveTargets,
  getWinner,
  boardValueToPlayerIndex,
  boardValueToSheepAmount,
  indexToCoordinate,
} from "../game/game";
import { simulate } from "../game/ai";

import { Tile } from "../components/Tile";
import { MoveSheep } from "./MoveSheep";
import { Players } from "../components/Players";
import { EndGame } from "./EndGame";

export type GameProps = {
  setAppState: (state: AppState) => void;
  config: ConfigSchema;
};

export function Game({ setAppState, config }: GameProps) {
  // Main states
  const [gameStatic, setGameStatic] = useState<GameStateStatic>();
  const [board, setBoard] = useState<Board>();
  const [info, setInfo] = useState<GameInfo>();
  const initDone =
    gameStatic !== undefined && board !== undefined && info !== undefined;

  // UI
  // Tile states
  const [selectedHex, setSelectedHex] = useState<BoardIndex>();
  const [highlightedHexes, setHighlightedHexes] = useState<BoardIndex[]>();
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  // Set this to true to end the player turn
  const [finished, setFinished] = useState(false);
  // Move sheep modal
  const [move, setMove] = useState<MoveTarget | undefined>(undefined);
  // Called from MoveSheepModal.tsx
  function makeMove(amount: number) {
    if (!move || !initDone) {
      return;
    }

    setBoard(moveSheep(board, move?.from, move?.to, amount, 0));

    // This closes the modal
    setMove(undefined);

    setHighlightedHexes(undefined);
    setSelectedHex(undefined);

    setFinished(true);
  }

  // Tile click handler
  function handleTileClick(
    index: BoardIndex,
    highlighted: boolean,
    selected: boolean,
  ) {
    if (selected || !initDone) {
      return;
    }

    if (highlighted) {
      if (info.selectingStart) {
        // Selecting starting tile
        setBoard(setSheep(board, index, 16, 0));

        // Remove the selected startTile so that AI can't overwrite it
        const newStartTiles = info.startTiles.filter(
          (value) => value !== index,
        );
        setInfo({
          gameEnded: false,
          selectingStart: true,
          startTiles: newStartTiles,
          winner: -1,
        });
        setHighlightedHexes(undefined);

        setFinished(true);
      } else if (selectedHex !== undefined) {
        // Check if there are sheep to move
        const value = board[selectedHex];

        // Bring up MoveSheep
        setMove({
          from: selectedHex,
          to: index,
          maxSheep: boardValueToSheepAmount(value) - 1,
        });
      }
      return;
    }

    setMove(undefined);

    // Select a tile
    const boardValue = board[index];

    // Check if the tile has more than 1 sheep on it and it's owned by player
    if (
      boardValueToSheepAmount(boardValue) > 1 &&
      boardValueToPlayerIndex(boardValue) === 0
    ) {
      const moves = getPossibleMovesFromTile(
        board,
        gameStatic.boardXSize,
        gameStatic.boardYSize,
        index,
      );
      setHighlightedHexes(moves);
      setSelectedHex(index);
    } else {
      // Clear selection
      setHighlightedHexes(undefined);
      setSelectedHex(undefined);
    }
  }

  // Called after the human player ends their turn
  useEffect(() => {
    if (!finished || !initDone) {
      return;
    }

    let aiDone = false;
    let selectingStart = info.selectingStart;
    let newBoard = board;

    while (!aiDone) {
      const situation = simulate(
        newBoard,
        gameStatic.boardXSize,
        gameStatic.boardYSize,
        6,
        selectingStart,
        info.startTiles,
      );
      selectingStart = false;
      newBoard = situation[0];

      // If player can't make any move
      if (
        getPossibleMoveTargets(
          newBoard,
          gameStatic.boardXSize,
          gameStatic.boardYSize,
          0,
        ).length === 0
      ) {
        // And AI can't move
        if (!situation[1]) {
          // End game
          const winner = getWinner(newBoard);
          setInfo({
            startTiles: [],
            gameEnded: true,
            selectingStart: false,
            winner,
          });
          aiDone = true;
        }
      } else {
        setInfo({
          startTiles: [],
          gameEnded: false,
          selectingStart: false,
          winner: -1,
        });
        aiDone = true;
      }
    }

    setBoard(newBoard);
    setFinished(false);
  }, [finished]);

  // Initialize game
  useEffect(() => {
    function resize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    // UI resize event
    window.addEventListener("resize", resize);

    // Game logic
    const game = initializeGame(config);
    setGameStatic(game.static);
    setBoard(game.dynamic.board);
    setInfo(game.dynamic.info);

    setHighlightedHexes(game.dynamic.info.startTiles);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const uiMultiplier = Math.min(dimensions.height, dimensions.width) / 810;
  return (
    <div>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: "center",
        }}
      >
        <button onClick={() => setAppState("config")} css={{ marginTop: 8 }}>
          Return
        </button>

        <div
          css={{
            display: "grid",
            gridTemplateColumns: "auto auto auto",
            gap: 16,
          }}
        >
          <Players />
          <MoveSheep move={move} makeMove={makeMove} />
          <EndGame info={info} setAppState={setAppState} />
        </div>
      </div>
      {initDone && (
        <div
          css={{
            position: "relative",
            left: `calc(50% - ${gameStatic.boardXSize} * calc(${uiMultiplier} * 30px))`,
          }}
        >
          {board.map((value, index) => {
            // 0 means missing tile in map
            if (value === 0) {
              return;
            }

            const highlighted = highlightedHexes
              ? highlightedHexes.includes(index)
              : false;
            const selected = selectedHex === index;
            const moving =
              move !== undefined && (move.to === index || move.from === index);

            const player = boardValueToPlayerIndex(value);
            const sheep = boardValueToSheepAmount(value);

            const isPlayerSheep = player === 0;
            const [x, y] = indexToCoordinate(index, gameStatic?.boardXSize);

            return (
              <Tile
                key={`${value}-${index}`}
                x={x}
                y={y}
                sheep={sheep}
                color={value === 1 ? "#fffc59" : ["#34eb46", "#1e6341"][player]}
                highlighted={highlighted}
                selected={selected}
                moving={moving}
                clickable={highlighted || (sheep > 1 && isPlayerSheep)}
                click={() => handleTileClick(index, highlighted, selected)}
                uiMultiplier={uiMultiplier}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
