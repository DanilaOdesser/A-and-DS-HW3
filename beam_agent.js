function copyBlocks(blocks) {
    let new_blocks = [];
    for (let x = 0; x < nx; x++) {
        new_blocks[x] = [];
        for (let y = 0; y < ny; y++) {
            new_blocks[x][y] = blocks[x][y];
        }
    }
    return new_blocks;
}

function evaluateBoard(board) {
    let aggregateHeight = 0;
    let completeLines = 0;
    let holes = 0;
    let bumpiness = 0;
    let columnHeights = new Array(nx).fill(0);

    for (let x = 0; x < nx; x++) {
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0 && board[x][y] !== null && board[x][y] !== undefined) {
                columnHeights[x] = ny - y;
                aggregateHeight += columnHeights[x];
                break;
            }
        }
    }

    for (let y = 0; y < ny; y++) {
        let complete = true;
        for (let x = 0; x < nx; x++) {
            if (board[x][y] === 0) {
                complete = false;
                break;
            }
        }
        if (complete)
            completeLines++;
    }

    for (let x = 0; x < nx; x++) {
        let blockFound = false;
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0) {
                blockFound = true;
            } else if (blockFound && board[x][y] === 0) {
                holes++;
            }
        }
    }

    for (let x = 0; x < nx - 1; x++) {
        bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
    }

    return -0.5 * aggregateHeight
        + 10 * Math.pow(2, completeLines - 1)
        - 20 * holes
        - 0.2 * bumpiness;
}

function getPossibleMovesForBoard(pieceType, board) {
    let moves = [];

    for (let dir = 0; dir < 4; dir++) {
        // For each horizontal position
        for (let x = -3; x < nx; x++) {
            let pieceCopy = {
                type: pieceType,
                dir: dir,
                x: x,
                y: 0
            };

            let y = getDropPositionForBoard(pieceCopy, x, dir, board);
            if (y === -1 || occupiedOnBoard(pieceType, x, y, dir, board)) {
                continue;
            }

            let new_blocks = copyBlocks(board);
            eachblock(pieceType, x, y, dir, function(bx, by) {
                if (bx >= 0 && bx < nx && by >= 0 && by < ny) {
                    new_blocks[bx][by] = pieceType;
                }
            });
            
            moves.push({
                piece: pieceCopy,
                x: x,
                y: y,
                dir: dir,
                board: new_blocks
            });
        }
    }
    return moves;
}

function occupiedOnBoard(type, x, y, dir, board) {
    let result = false;
    eachblock(type, x, y, dir, function(bx, by) {
        if ((bx < 0) || (bx >= nx) || (by < 0) || (by >= ny) || board[bx][by]) {
            result = true;
        }
    });
    return result;
}

function getDropPositionForBoard(piece, x, dir, board) {
    let y = -1;
    while (!occupiedOnBoard(piece.type, x, y + 1, dir, board)) {
        y++;
        if (y >= ny) break;
    }
    return y;
}

function selectBestMoveBeamSearch(currentPiece, nextPiece, beamWidth = 5) {
    const currentMoves = getPossibleMovesForBoard(currentPiece.type, blocks);
    
    if (!currentMoves.length) return null;

    let candidates = [];

    for (const move1 of currentMoves) {
        const nextMoves = getPossibleMovesForBoard(nextPiece.type, move1.board);

        if (!nextMoves.length) {
            const score = evaluateBoard(move1.board);
            candidates.push({ 
                firstMove: move1, 
                score: score 
            });
        } else {
            let bestNextScore = -Infinity;
            for (const move2 of nextMoves) {
                const score2 = evaluateBoard(move2.board);
                if (score2 > bestNextScore) {
                    bestNextScore = score2;
                }
            }

            candidates.push({ 
                firstMove: move1, 
                score: bestNextScore 
            });
        }
    }

    if (!candidates.length) {
        currentMoves.sort((a, b) => evaluateBoard(b.board) - evaluateBoard(a.board));
        return currentMoves[0];
    }
    candidates.sort((a, b) => b.score - a.score);
    const beam = candidates.slice(0, Math.min(beamWidth, candidates.length));
    return beam[0].firstMove;
}


function agentBeam() {
    let bestMove = selectBestMoveBeamSearch(current, next, 5);
    if (bestMove) {
        current.x = bestMove.x;
        current.y = bestMove.y;
        current.dir = bestMove.dir;
        drop();
    }
}