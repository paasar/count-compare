interface PartGroup {
    count: number,
    continuation: boolean,
    square: boolean,
    newRow: boolean
}

interface AmountPart {
    color: string,
    x: number,
    y: number,
    currentY: number
}

let ctx: CanvasRenderingContext2D;

let amountParts: Array<AmountPart> = []

const partSize = 10;
const partMargin = 2;

let width: number;
let height: number;

// TODO nice colors
const colors = [[255, 0, 0],
                [0, 255, 0],
                [0, 0, 255],
                [255, 255, 0],
                [0, 255, 255],
                [255, 0, 255]]

interface Array<T> {
    fill(value: T): Array<T>;
}

function draw() {
    if (ctx) {
        // clean previous frame renders
        amountParts.forEach((part) => {
            ctx.clearRect(part.x, part.currentY, partSize, partSize);
        });

        // update state
        amountParts = amountParts.map((part) => {
            part.currentY -= 30;
            if (part.currentY < part.y) part.currentY = part.y
            return part;
        });

        // render
        amountParts.forEach((part) => {
            if (part.x >= 0 && part.x < width &&
                part.currentY >= 0 && part.currentY < height) {
                ctx.clearRect(part.x, part.currentY, partSize, partSize);

                ctx.fillStyle = part.color;
                ctx.fillRect(part.x, part.currentY, partSize, partSize);
            }
        });

        // remove those in place
        amountParts = amountParts.filter((part) => part.y !== part.currentY);

        window.requestAnimationFrame(draw);
    }
}

function parsePartGroups(input: string): Array<PartGroup> {
    let result: Array<PartGroup> = [];
    const regexSections = /(([ spc]+)*(\d+))+?/g
    const splittedString = input.match(regexSections)
    splittedString?.forEach((value) => {
        const connectionAndNumberString = value.match(/([ spc]*)?(\d+)/);

        if (connectionAndNumberString) {
            let parsedNumber = parseInt(connectionAndNumberString[2], 10);
            if (parsedNumber > 1024) {
                parsedNumber = 1024;
                document.getElementById('cap-warning')!.setAttribute('style', 'display: block;');
            }
            const continuation = connectionAndNumberString[1] ? connectionAndNumberString[1].indexOf('p') !== -1 : false;
            const square = connectionAndNumberString[1] ? connectionAndNumberString[1].indexOf('s') !== -1 : false;
            const newRow = connectionAndNumberString[1] ? connectionAndNumberString[1].indexOf('c') !== -1 : false;

            result.push({
                count: parsedNumber,
                continuation,
                square,
                newRow
            });
        } else {
            console.log('Invalid input: ' + value);
        }
    });

    return result;
}

function createAmountParts(partGroups: Array<PartGroup>, canvasHeight: number): Array<AmountPart> {
    let result: Array<AmountPart> = [];

    // 1 2 3  = 1 2 2 3 3 3
    // 1p2p3  = 1 2 3
    // 3c4    = 3 3 3
    //          4 4 4 4
    // s3     = 3 3
    //          3
    // TODO other syntax
    // s3ps9  = 3 3 9
    //          3 9 9
    //          9 9 9
    let countOnRow = 0;
    let row = 0;
    let includedInContinuation = 0;
    const maxColorIndex = colors.length - 1;
    partGroups.forEach((partGroup, index) => {
        if (!partGroup.continuation || partGroup.newRow) includedInContinuation = 0
        if (partGroup.newRow) {
            row += 1;
            countOnRow = 0;
        }

        const parts = partGroup.continuation ? partGroup.count - includedInContinuation : partGroup.count;
        if (parts > 0) {
            const startColumn = countOnRow;
            let squareStarted = false;

            new Array<number>(parts).fill(0).forEach((_, partIndex) => {
                const colorIndex = index % maxColorIndex;

                if (partGroup.square && partIndex % Math.ceil(Math.sqrt(parts)) === 0) {
                    if (squareStarted) {
                        row += 1;
                    }
                    squareStarted = true;

                    countOnRow = startColumn;
                }

                const amountPart = {
                    color: 'rgb(' + colors[colorIndex][0] + ', ' +
                                    colors[colorIndex][1] + ', ' +
                                    colors[colorIndex][2] + ')',
                    x: countOnRow * (partSize + partMargin),
                    y: row * (partSize + partMargin),
                    currentY: canvasHeight + (countOnRow * row + countOnRow) * 10 + row * (partSize + partMargin)
                };
                result.push(amountPart);
                countOnRow += 1;
                includedInContinuation += 1;
            });
        }
    });
    return result;
}

function start() {
    const canvas = <HTMLCanvasElement>document.getElementById('ccc');
    if (canvas) {
        ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        const input = <HTMLInputElement>document.getElementById('formula');
        const url = new URL(window.location.href);
        const c = url.searchParams.get("formula");
        if (input) input.value = c || '3p6p10c3 6cs3cs25';

        width = canvas.width;
        height = canvas.height;

        // TODO add only if listener doesn't already exists
        input.addEventListener('input', (ev) => {
            const target = <HTMLInputElement>ev.target
            // TODO update only changed partGroups when formula changes
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            amountParts = createAmountParts(parsePartGroups(target.value), height);
        });

        amountParts = createAmountParts(parsePartGroups(input.value), height);

        window.requestAnimationFrame(draw);
    } else {
        alert('Couldn\'t get canvas');
    }
}
