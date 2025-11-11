// Heuristic evaluation function

function printBoard(board) {
    console.log("=== BOARD STATE ===");
    let output = "";
    for (let y = 0; y < ny; y++) {
        let row = "";
        for (let x = 0; x < nx; x++) {
            if (board[x][y] === 0 || board[x][y] === null || board[x][y] === undefined) {
                row += ". ";
            } else {
                // Print first letter of color
                row += board[x][y].color.charAt(0).toUpperCase() + " ";
            }
        }
        output += row + "\n";
    }
    console.log(output);
    console.log("===================");
}


function evaluateBoard(board) {
    //printBoard(board);
    let aggregateHeight = 0;
    let completeLines = 0;
    let holes = 0;
    let bumpiness = 0;
    let columnHeights = new Array(nx).fill(0);
    let maxColumnHeight = 0;

    // Calculate aggregate height and column heights
    for (let x = 0; x < nx; x++) {
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0 && board[x][y] !== null && board[x][y] !== undefined) {
                columnHeights[x] = ny - y;
                aggregateHeight += columnHeights[x];
                maxColumnHeight = Math.max(maxColumnHeight, columnHeights[x]);
                break;
            }
        }
    }
    //console.log("Column Heights:", columnHeights);

    // Calculate complete lines
    for (let y = 0; y < ny; y++) {
        var complete = true;
        for (let x = 0; x < nx; x++) {
            if (board[x][y] === 0) {
                complete = false;
                break;
            }
        }
        if (complete)
            completeLines++;
    }

    // Calculate holes
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

    // Calculate bumpiness
    for (let x = 0; x < nx - 1; x++) {
        bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
    }
    //console.log(maxColumnHeight, aggregateHeight, holes, completeLines)

    //Combine features into a heuristic score
    return -0.5 * aggregateHeight
        + 10 * Math.pow(2, completeLines - 1)
        - 20 * holes
        - 0.2 * bumpiness
        - 5 * maxColumnHeight;
}

// Function to deep copy the blocks array
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

// Generate all possible moves for the current piece
function getPossibleMoves(piece) {
    let moves = [];
    // For each rotation of the piece
    for (let dir = 0; dir < 4; dir++) {
        // For each horizontal position
        for (let x = -3; x < nx; x++) {
            //console.log("x: ", x)
            let pieceCopy = {
                type: piece.type,
                dir: dir,
                x: x,
                y: piece.y
            };
            //console.log("x: ", x)
            let y = getDropPosition(pieceCopy, x);
            if (y === -1 || occupied(pieceCopy.type, x, y, dir)) {
                //console.log("Missed x: ", x)
                continue;
            }
            let new_blocks = copyBlocks(blocks);
            eachblock(pieceCopy.type, x, y, pieceCopy.dir, function(x, y) {
                new_blocks[x][y] = pieceCopy.type;
            });
            //console.log("Hit x: ", x)
            moves.push({piece: pieceCopy, x: x, y: y, board: new_blocks});
        }
    }
    //console.log(`Total moves for ${piece.type.color}: ${moves.length}`);
    //console.log('X positions:', moves.map(m => `x=${m.x},dir=${m.piece.dir}`));
    return moves;
}

// Select the best move based on heuristic evaluation
function selectBestMove(piece, board) {
    let moves = getPossibleMoves(piece);
    let bestMove = null;
    let bestScore = -Infinity;
    //console.log("NEW PIECE: moves.size: ", moves.length)
    moves.forEach(move => {
        let score = evaluateBoard(move.board);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    return bestMove;
}

// Function to get the drop position of the piece
function getDropPosition(piece, x) {
    let y = -1;
    while (!occupied(piece.type, x, y + 1, piece.dir)) {
        y++;
    }
    return y;
}
