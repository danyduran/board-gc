import React, { useMemo, useState } from 'react';
import Wall from './images/wall.png';
import Dark from './images/dark.jpeg';
import Bulb from './images/bulb.jpeg';
import Bright from './images/bright.jpeg';
import "./Board.css"

const HEIGHT = 70;
const WIDTH = 70;
const DIRECTIONS = {
    "top": { dirCol: -1, dirRow: 0 },
    "bottom": { dirCol: 1, dirRow: 0 },
    "left": { dirCol: 0, dirRow: -1 },
    "right": { dirCol: 0, dirRow: 1 },
}

const IMAGES = {
    "0": <img src={Dark} className="responsive" alt="Darkness" />,
    "1": <img src={Wall} className="responsive" alt="Wall" />,
    "2": <img src={Bulb} className="responsive" alt="Bulb" />,
    "3": <img src={Bright} className="responsive" alt="Bright" />
}

const TYPES_BULB = {
    "bulbOn": 2,
    "bright": 3,
    "wall": 1,
    "darkness": 0
}


function Cell({ width, height, value, setBulb }) {
    return (
        <div className="cell" style={{ width: width + "vw", height: height + "%" }} onClick={setBulb}>
            {IMAGES[value]}
        </div>
    )
}

function Board() {
    const [matrix, setMatrix] = useState([]);

    const loadFile = (event) => {
        const newMatrix = []
        event.preventDefault()
        const reader = new FileReader()
        reader.onload = async (event) => {
            const text = (event.target.result)
            const lines = text.split("\n")
            for (let index in lines) {
                const cells = lines[index].split(",")
                newMatrix.push(cells.map((cell) => parseInt(cell)))
            }

        };
        reader.onloadend = async () => {
            setMatrix(newMatrix)
        }
        reader.readAsText(event.target.files[0])
    }

    const floodFill = (row, col, newBoard, value, direction) => {
        if (row < 0 || row >= newBoard.length || col < 0 || col >= newBoard[0].length) {
            return newBoard
        }

        const cellValue = newBoard[row][col]
        if (cellValue === TYPES_BULB["wall"]) {
            return newBoard
        }

        newBoard[row][col] = value
        const { dirRow, dirCol } = direction

        newBoard = floodFill(row + dirRow, col + dirCol, newBoard, value, direction)
        return newBoard

    }

    const changeCell = (row, col) => {
        let newMatrix = structuredClone(matrix)
        const value = newMatrix[row][col]
        let cellValue, aroundCellValue

        if (value !== TYPES_BULB["wall"] && value !== TYPES_BULB["bright"]) {
            if (value === TYPES_BULB["darkness"]) {
                cellValue = TYPES_BULB["bulbOn"]
                aroundCellValue = TYPES_BULB["bright"]
            } else if (value === TYPES_BULB["bulbOn"]) {
                cellValue = TYPES_BULB["darkness"]
                aroundCellValue = TYPES_BULB["darkness"]
            }

            newMatrix = floodFill(row, col, newMatrix, aroundCellValue, DIRECTIONS["left"])
            newMatrix = floodFill(row, col, newMatrix, aroundCellValue, DIRECTIONS["right"])
            newMatrix = floodFill(row, col, newMatrix, aroundCellValue, DIRECTIONS["top"])
            newMatrix = floodFill(row, col, newMatrix, aroundCellValue, DIRECTIONS["bottom"])
            newMatrix[row][col] = cellValue

            for (let row = 0; row < newMatrix.length; row++) {
                for (let col = 0; col < newMatrix[row].length; col++) {
                    const value = newMatrix[row][col]

                    if (value === TYPES_BULB["bulbOn"]) {
                        const newValue = TYPES_BULB["bright"]
                        newMatrix = floodFill(row, col, newMatrix, newValue, DIRECTIONS["left"])
                        newMatrix = floodFill(row, col, newMatrix, newValue, DIRECTIONS["right"])
                        newMatrix = floodFill(row, col, newMatrix, newValue, DIRECTIONS["top"])
                        newMatrix = floodFill(row, col, newMatrix, newValue, DIRECTIONS["bottom"])
                        newMatrix[row][col] = TYPES_BULB["bulbOn"]
                    }
                }
            }

            setMatrix(newMatrix)
        }
    }

    const cells = []
    useMemo(() => {
        for (let row = 0; row < matrix.length; row++) {
            const widthCell = (WIDTH - 2) / matrix[row].length
            const heightCell = (HEIGHT) / matrix.length
            for (let col = 0; col < matrix[row].length; col++) {
                const cell = <Cell
                    key={`cell-${row}${col}`}
                    row={row}
                    col={col}
                    width={widthCell}
                    height={heightCell}
                    value={matrix[row][col]}
                    setBulb={() => changeCell(row, col)}
                />
                cells.push(cell)
            }
        }
    }, [matrix, cells])

    return (
        <div className='main'>
            <div className="board" style={{ width: WIDTH + "vw", height: HEIGHT + "vh" }}>
                {cells}
            </div>
            <input type="file" onChange={(e) => loadFile(e)}></input>
        </div>
    )
}

export default Board