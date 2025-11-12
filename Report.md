# Report:

---

## Code Issues and Fixes

### heuristic_agent.js

- **[Lines 33-34](./heuristic_agent.js#L33-L34)**: Loop order is incorrect. The outer loop should iterate over `x` (columns) and the inner loop over `y` (rows). When calculating column heights with a `break` statement, having `y` as the outer loop causes incorrect height calculations for some columns.

- **[Line 35](./heuristic_agent.js#L35)**: The condition checking for occupied cells should also handle `null` and `undefined` values, as `board[x][y]` can be any of these types for empty cells.

- **[Line 104](./heuristic_agent.js#L104)**: Loop bounds should be extended to `x = -3` through `x < nx`. Due to piece encoding in a 4×4 bounding box, some rotations (e.g., vertical I-piece at rotation 1 encoded as `0x2222`) place blocks in column 1 of the bounding box. Without negative x-values, these pieces cannot be placed in the leftmost board column (x = 0).

- **[Lines 104-109](./heuristic_agent.js#L104-L109)**: The original piece object was being mutated by setting `piece.dir = dir`, causing all moves in the list to reference the same mutated object. Instead, create a new `pieceCopy` object with the correct direction for each move.

- **[Lines 112-115](./heuristic_agent.js#L112-L115)**: Validation should check that the piece placement is within board bounds and does not overlap with existing blocks before adding it to the moves list.
---
let's benchmark code after all fixes: 
heuristic_agent.js 

GAME AFTER FIXING ALL BUGS:

`game.js:209 Game Over! Final Score: 9060, Rows Cleared: 69`
`game.js:209 Game Over! Final Score: 8320, Rows Cleared: 62`
`game.js:209 Game Over! Final Score: 4360, Rows Cleared: 32`
`game.js:209 Game Over! Final Score: 10500, Rows Cleared: 80`
`game.js:209 Game Over! Final Score: 8960, Rows Cleared: 68`
`game.js:209 Game Over! Final Score: 4490, Rows Cleared: 33`
`game.js:209 Game Over! Final Score: 5780, Rows Cleared: 43`
`game.js:209 Game Over! Final Score: 3510, Rows Cleared: 25`
`game.js:209 Game Over! Final Score: 5480, Rows Cleared: 40`
`game.js:209 Game Over! Final Score: 3260, Rows Cleared: 23`

### Statistics:

- **Mean Score**: 6,372
- **Mean Rows Cleared**: 47.5

---

Let's tune weights. For the 2nd parameter we use 2 to the power of 
completeLines—1 since the scoring system is based on this power function.

GAME AFTER FIXING ALL BUGS and TURNED WEIGHTS:

`game.js:209 Game Over! Final Score: 7870, Rows Cleared: 59`
`game.js:209 Game Over! Final Score: 7880, Rows Cleared: 59`
`game.js:209 Game Over! Final Score: 4840, Rows Cleared: 36`
`game.js:209 Game Over! Final Score: 6220, Rows Cleared: 47`
`game.js:209 Game Over! Final Score: 19800, Rows Cleared: 150`
`game.js:209 Game Over! Final Score: 8040, Rows Cleared: 57`
`game.js:209 Game Over! Final Score: 5750, Rows Cleared: 43`
`game.js:209 Game Over! Final Score: 11830, Rows Cleared: 91`
`game.js:209 Game Over! Final Score: 8020, Rows Cleared: 58`
`game.js:209 Game Over! Final Score: 4860, Rows Cleared: 36`

**Statistics:**
- **Mean Score**: 8,511
- **Mean Rows Cleared**: 63.6

---

Let's also add the maxColumnHeight parameter. 
It should be negative since we want to minimize it.

GAME AFTER FIXING ALL BUGS, TURNED WEIGHTS 
AND ADDING MAXCOLUMNHEIGHT PARAMETER:


`game.js:209 Game Over! Final Score: 10630, Rows Cleared: 82`
`game.js:209 Game Over! Final Score: 5020, Rows Cleared: 34`
`game.js:209 Game Over! Final Score: 9390, Rows Cleared: 68`
`game.js:209 Game Over! Final Score: 14370, Rows Cleared: 111`
`game.js:209 Game Over! Final Score: 6220, Rows Cleared: 45`
`game.js:209 Game Over! Final Score: 6230, Rows Cleared: 45`
`game.js:209 Game Over! Final Score: 12920, Rows Cleared: 102`
`game.js:209 Game Over! Final Score: 6370, Rows Cleared: 47`
`game.js:209 Game Over! Final Score: 6490, Rows Cleared: 48`
`game.js:209 Game Over! Final Score: 18600, Rows Cleared: 138`
`game.js:209 Game Over! Final Score: 8930, Rows Cleared: 68`

**Statistics:**
- **Mean Score**: 9,561
- **Mean Rows Cleared**: 71.6

---

## Beam search

Out of probabilistic algorithms, beam search is the most suitable for this task. 
It evaluates all possible placements of the current piece, then simulates placing the next piece on each resulting board state, scoring each two-move sequence and selecting the current move that leads to the best future outcome.
Let's see how beam search performs on this task: 

`game.js:209 Game Over! Final Score: 40890, Rows Cleared: 314`
`game.js:209 Game Over! Final Score: 25200, Rows Cleared: 193`

I couldn't manage to do 10 runs because its too long :) 
But clearly beam search overperforms greedy heuristic search.
---
## OPTIMIZING THE WEIGHTS
I realised that the weights are too high and the game is not playing well. 
I lowered them and made more balanced:

*     return -0.7 * aggregateHeight + 
        2 * Math.pow(2, completeLines - 1) - 0.2 * holes -
        0.1 * bumpiness - 0.03 * maxColumnHeight;

and got the following results for heuristic search:

`game.js:209 Game Over! Final Score: 46990, Rows Cleared: 337`
`game.js:209 Game Over! Final Score: 32090, Rows Cleared: 236`
`game.js:209 Game Over! Final Score: 6530, Rows Cleared: 46`
`game.js:209 Game Over! Final Score: 33110, Rows Cleared: 239`
`game.js:209 Game Over! Final Score: 12910, Rows Cleared: 92`

**Statistics:**
- **Mean Score**: 26,326
- **Mean Rows Cleared**: 190

and for beam search:

`game.js:209 Game Over! Final Score: 160790, Rows Cleared: 1158`
`game.js:209 Game Over! Final Score: 63470, Rows Cleared: 442`
`game.js:209 Game Over! Final Score: 177340, Rows Cleared: 1293`
`game.js:209 Game Over! Final Score: 30360, Rows Cleared: 211`
`game.js:209 Game Over! Final Score: 22000, Rows Cleared: 150`
`game.js:209 Game Over! Final Score: 259290, Rows Cleared: 1889`

**Statistics:**
- **Mean Score**: 118,875
- **Mean Rows Cleared**: 857