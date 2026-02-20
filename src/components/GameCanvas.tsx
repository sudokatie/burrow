'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, GameScreen, DesignMode, BuildType, Position } from '../game/types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../game/constants';
import {
  createGame,
  startGame,
  updateGame,
  togglePause,
  setDesignMode,
  setSelectedBuild,
  setSelectedPriority,
  designateArea,
} from '../game/Game';
import { renderGame, renderSelection } from '../game/Renderer';
import { Sound } from '../game/Sound';
import { Music } from '../game/Music';

import TitleScreen from './TitleScreen';
import StatusBar from './StatusBar';
import ColonistPanel from './ColonistPanel';
import TaskPanel from './TaskPanel';
import AlertLog from './AlertLog';
import HelpOverlay from './HelpOverlay';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<GameState>(() => createGame());
  const [showHelp, setShowHelp] = useState(false);
  const [dragStart, setDragStart] = useState<Position | null>(null);
  const [dragEnd, setDragEnd] = useState<Position | null>(null);
  
  const lastTimeRef = useRef<number>(0);
  const gameRef = useRef<GameState>(game);
  
  // Keep ref in sync with state
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  
  // Game loop
  useEffect(() => {
    if (game.screen !== GameScreen.PLAYING) return;
    
    let animationId: number;
    
    const loop = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = time;
      
      // Limit dt to prevent huge jumps
      const clampedDt = Math.min(dt, 0.1);
      
      const currentGame = gameRef.current;
      updateGame(currentGame, clampedDt);
      setGame({ ...currentGame });
      
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [game.screen, game.paused]);
  
  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    renderGame(ctx, game);
    
    // Draw selection overlay if dragging
    if (dragStart && dragEnd && game.designMode !== DesignMode.NONE) {
      renderSelection(ctx, dragStart, dragEnd);
    }
  }, [game, dragStart, dragEnd]);

  // Switch music track based on game screen
  useEffect(() => {
    switch (game.screen) {
      case GameScreen.TITLE:
      case GameScreen.HELP:
        Music.play('menu');
        break;
      case GameScreen.PLAYING:
      case GameScreen.PAUSED:
        Music.play('gameplay');
        break;
    }
  }, [game.screen]);
  
  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (game.screen !== GameScreen.PLAYING) return;
      
      switch (e.key.toLowerCase()) {
        case 'd':
          // Cycle through designations
          Sound.play('select');
          if (game.designMode === DesignMode.MINE) {
            setDesignMode(game, DesignMode.CHOP);
          } else {
            setDesignMode(game, DesignMode.MINE);
          }
          setGame({ ...game });
          break;
          
        case 'b':
          // Build mode - cycle through build types
          Sound.play('select');
          if (game.designMode === DesignMode.BUILD) {
            const types = [BuildType.WALL, BuildType.FLOOR, BuildType.DOOR, BuildType.BED];
            const currentIdx = game.selectedBuild ? types.indexOf(game.selectedBuild) : -1;
            const nextIdx = (currentIdx + 1) % types.length;
            setSelectedBuild(game, types[nextIdx]);
          } else {
            setSelectedBuild(game, BuildType.WALL);
          }
          setGame({ ...game });
          break;
          
        case 's':
          Sound.play('select');
          setDesignMode(game, DesignMode.STOCKPILE);
          setGame({ ...game });
          break;
          
        case ' ':
          e.preventDefault();
          Sound.play('select');
          togglePause(game);
          setGame({ ...game });
          break;
          
        case 'escape':
          setDesignMode(game, DesignMode.NONE);
          setDragStart(null);
          setDragEnd(null);
          setGame({ ...game });
          break;
          
        case '?':
          setShowHelp(true);
          break;
          
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          setSelectedPriority(game, parseInt(e.key));
          setGame({ ...game });
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game]);
  
  // Mouse/touch handlers
  const getTilePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    return { x, y };
  }, []);

  const getTilePosFromTouch = useCallback((touch: React.Touch): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((touch.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((touch.clientY - rect.top) / TILE_SIZE);
    
    return { x, y };
  }, []);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (game.screen !== GameScreen.PLAYING) return;
    if (game.designMode === DesignMode.NONE) return;
    
    const pos = getTilePos(e);
    setDragStart(pos);
    setDragEnd(pos);
  }, [game.screen, game.designMode, getTilePos]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart) return;
    
    const pos = getTilePos(e);
    setDragEnd(pos);
  }, [dragStart, getTilePos]);
  
  const handleMouseUp = useCallback(() => {
    if (!dragStart || !dragEnd) return;
    if (game.designMode === DesignMode.NONE) return;
    
    // Play appropriate sound for designation type
    switch (game.designMode) {
      case DesignMode.MINE:
        Sound.play('mine');
        break;
      case DesignMode.CHOP:
        Sound.play('chop');
        break;
      case DesignMode.BUILD:
        Sound.play('build');
        break;
      default:
        Sound.play('select');
    }
    
    designateArea(game, dragStart, dragEnd);
    setGame({ ...game });
    
    setDragStart(null);
    setDragEnd(null);
  }, [dragStart, dragEnd, game]);
  
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    // Right-click cancels current mode
    setDesignMode(game, DesignMode.NONE);
    setDragStart(null);
    setDragEnd(null);
    setGame({ ...game });
  }, [game]);

  // Touch handlers (mirror mouse handlers for mobile support)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (game.screen !== GameScreen.PLAYING) return;
    if (game.designMode === DesignMode.NONE) return;
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    const pos = getTilePosFromTouch(e.touches[0]);
    setDragStart(pos);
    setDragEnd(pos);
  }, [game.screen, game.designMode, getTilePosFromTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!dragStart) return;
    if (e.touches.length !== 1) return;
    
    e.preventDefault();
    const pos = getTilePosFromTouch(e.touches[0]);
    setDragEnd(pos);
  }, [dragStart, getTilePosFromTouch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!dragStart || !dragEnd) return;
    if (game.designMode === DesignMode.NONE) return;
    
    e.preventDefault();
    
    // Play appropriate sound for designation type
    switch (game.designMode) {
      case DesignMode.MINE:
        Sound.play('mine');
        break;
      case DesignMode.CHOP:
        Sound.play('chop');
        break;
      case DesignMode.BUILD:
        Sound.play('build');
        break;
      default:
        Sound.play('select');
    }
    
    designateArea(game, dragStart, dragEnd);
    setGame({ ...game });
    
    setDragStart(null);
    setDragEnd(null);
  }, [dragStart, dragEnd, game]);
  
  // Game start handler
  const handleStart = useCallback(() => {
    startGame(game);
    setGame({ ...game });
  }, [game]);
  
  return (
    <div className="relative" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={() => {
          setDragStart(null);
          setDragEnd(null);
        }}
      />
      
      {game.screen === GameScreen.TITLE && (
        <TitleScreen onStart={handleStart} />
      )}
      
      {game.screen === GameScreen.PLAYING && (
        <>
          <StatusBar game={game} />
          <ColonistPanel colonists={game.colonists} />
          <TaskPanel tasks={game.tasks} />
          <AlertLog messages={game.messages} />
        </>
      )}
      
      {showHelp && (
        <HelpOverlay onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
}
