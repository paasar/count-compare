interface AmountPart {
    color: string,
    x: number,
    y: number,
    currentY: number
}

let ctx: CanvasRenderingContext2D;

let amountParts: Array<AmountPart> = []

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
            ctx.clearRect(part.x, part.currentY, 5, 5);
        });

        // update state
        amountParts = amountParts.map((part) => {
            part.currentY -= 30;
            if (part.currentY < part.y) part.currentY = part.y
            return part;
        });

        // render
        amountParts.forEach((part) => {
            ctx.clearRect(part.x, part.currentY, 5, 5);

            ctx.fillStyle = part.color;
            ctx.fillRect(part.x, part.currentY, 5, 5);
        });

        // remove those in place
        amountParts = amountParts.filter((part) => part.y !== part.currentY);

        window.requestAnimationFrame(draw);
    }
}

function createAmountParts(amounts: Array<number>, canvasHeight: number): Array<AmountPart> {
    let result: Array<AmountPart> = [];

    // 1 2 3 = 1 2 2 3 3 3
    // TODO other syntax
    // 1p2p3 = 1 2 3
    // 3s    = 3 3
    //         3
    // 3sp9  = 3 3 9
    //         3 9 9
    //         9 9 9
    // 3c4   = 3 3 3
    //         4 4 4 4
    let count = 0;
    const maxColorIndex = colors.length - 1;
    amounts.forEach((value, index) => {
        new Array<number>(value).fill(0).forEach(() => {
            const colorIndex = index % maxColorIndex;
            const amountPart = {
                color: 'rgb(' + colors[colorIndex][0] + ', ' +
                                colors[colorIndex][1] + ', ' +
                                colors[colorIndex][2] + ')',
                x: count * 6,
                y: 0,
                currentY: canvasHeight + count * 10
            };
            result.push(amountPart);
            count += 1;
        });
    });
    return result;
}

function start() {
    const canvas = <HTMLCanvasElement>document.getElementById('ccc');
    if (canvas) {
        ctx = <CanvasRenderingContext2D>canvas.getContext('2d');

        const input = <HTMLInputElement>document.getElementById('formula');
        if (input) input.value = '3 6 38 10';

        const height = canvas.height;

        // TODO add only if doesn't exists
        input.addEventListener('input', (ev) => {
            const target = <HTMLInputElement>ev.target
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            amountParts = createAmountParts(target.value.trim().split(' ').map(x => parseInt(x)), height);
        });

        const amounts = input.value.split(' ').map(x => parseInt(x));

        amountParts = createAmountParts(amounts, height);

        window.requestAnimationFrame(draw);
    } else {
        alert('Couldn\'t get canvas');
    }
}
