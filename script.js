$(document).ready(function () {
    const game = new Chess();
    const board = $('.board');
    const pieceIcons = {
        'R': '\u265C',
        'N': '\u265E',
        'B': '\u265D',
        'Q': '\u265B',
        'K': '\u265A',
        'P': '\u265F',
        'r': '\u2656',
        'n': '\u2658',
        'b': '\u2657',
        'q': '\u2655',
        'k': '\u2654',
        'p': '\u2659'
    };
    

    const startingPosition = [
        "R", "N", "B", "Q", "K", "B", "N", "R",
        "P", "P", "P", "P", "P", "P", "P", "P",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "", "", "", "", "", "", "", "",
        "p", "p", "p", "p", "p", "p", "p", "p",
        "r", "n", "b", "q", "k", "b", "n", "r"
    ];

    function createBoard() {
        for (let i = 0; i < 64; i++) {
            let square = $('<div>').addClass('square').data('index', i);
            if ((i + Math.floor(i / 8)) % 2 === 0) {
                square.addClass('light');
            } else {
                square.addClass('dark');
            }
            board.append(square);
        }
    }

    function placePieces() {
        for (let i = 0; i < startingPosition.length; i++) {
            let piece = startingPosition[i];
            if (piece !== "") {
                let pieceElement = $('<span>')
                    .addClass('piece')
                    .text(pieceIcons[piece])
                    .data('index', i)
                    .attr('draggable', 'true');
                $('.square').eq(i).append(pieceElement);
            }
        }
    
        // Attach event handlers after the pieces are created
        $('.piece').on('dragstart', handleDragStart);
        $('.square').on('dragover', handleDragOver);
        $('.square').on('drop', handleDrop);
    }
    
    function checkGameState() {
        if (game.in_checkmate()) {
            alert('Checkmate! Game Over.');
        } else if (game.in_stalemate()) {
            alert('Stalemate! Game Over.');
        } else if (game.in_draw()) {
            alert('Draw! Game Over.');
        } else if (game.in_check()) {
            alert('Check!');
        }
    }
    

    function handleDragStart(e) {
        e.originalEvent.dataTransfer.setData('text/plain', $(e.target).data('index'));
    }
    

    function handleDragOver(e) {
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e) {
        e.preventDefault();
        const sourceIndex = e.originalEvent.dataTransfer.getData('text/plain');
        const targetIndex = $(this).data('index');
        const sourceSquare = $('.square').eq(sourceIndex);
        const targetSquare = $('.square').eq(targetIndex);
        const piece = sourceSquare.children('.piece');
        
        const sourceNotation = indexToAlgebraic(sourceIndex);
        const targetNotation = indexToAlgebraic(targetIndex);
        
        // Check if the move is valid
        const move = game.move({
            from: sourceNotation,
            to: targetNotation,
            promotion: 'q' // Always promote to queen for simplicity
        });
        
        if (move === null) {
            // If the move is invalid, do not move the piece
            return;
        }
        
        // Move the piece to the new square
        piece.data('index', targetIndex).appendTo(targetSquare);
        
        // Remove any captured pieces
        targetSquare.find('.piece').not(piece).remove();
    
        // Handle castling
        if (move.flags.includes('k') || move.flags.includes('q')) {
            const isKingside = move.flags.includes('k');
            const rookSourceFile = isKingside ? sourceNotation[0].charCodeAt(0) + 3 : sourceNotation[0].charCodeAt(0) - 4;
            const rookTargetFile = isKingside ? sourceNotation[0].charCodeAt(0) + 1 : sourceNotation[0].charCodeAt(0) - 1;
            const rookSourceNotation = String.fromCharCode(rookSourceFile) + sourceNotation[1];
            const rookTargetNotation = String.fromCharCode(rookTargetFile) + sourceNotation[1];
            const rookSourceIndex = algebraicToIndex(rookSourceNotation);
            const rookTargetIndex = algebraicToIndex(rookTargetNotation);
            const rookSourceSquare = $('.square').eq(rookSourceIndex);
            const rookTargetSquare = $('.square').eq(rookTargetIndex);
            const rookPiece = rookSourceSquare.children('.piece');
    
            // Move the rook to the new square
            rookPiece.data('index', rookTargetIndex).appendTo(rookTargetSquare);
        }

        checkGameState();
    }    
    
    function indexToAlgebraic(index) {
        const file = 'abcdefgh'[index % 8];
        const rank = 8 - Math.floor(index / 8);
        return file + rank;
    }
    
    function algebraicToIndex(algebraic) {
        const file = algebraic[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = 8 - parseInt(algebraic[1], 10);
        return rank * 8 + file;
    }    

    createBoard();
    placePieces();
});
