"use strict";
var ctx;
var amountParts = [];
var partSize = 10;
var partMargin = 2;
var width;
var height;
// TODO nice colors
var colors = [[255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
    [0, 255, 255],
    [255, 0, 255]];
function draw() {
    if (ctx) {
        // clean previous frame renders
        amountParts.forEach(function (part) {
            ctx.clearRect(part.x, part.currentY, partSize, partSize);
        });
        // update state
        amountParts = amountParts.map(function (part) {
            part.currentY -= 30;
            if (part.currentY < part.y)
                part.currentY = part.y;
            return part;
        });
        // render
        amountParts.forEach(function (part) {
            if (part.x >= 0 && part.x < width &&
                part.currentY >= 0 && part.currentY < height) {
                ctx.clearRect(part.x, part.currentY, partSize, partSize);
                ctx.fillStyle = part.color;
                ctx.fillRect(part.x, part.currentY, partSize, partSize);
            }
        });
        // remove those in place
        amountParts = amountParts.filter(function (part) { return part.y !== part.currentY; });
        window.requestAnimationFrame(draw);
    }
}
function parsePartGroups(input) {
    var result = [];
    var regexSections = /(([ spc]+)*(\d+))+?/g;
    var splittedString = input.match(regexSections);
    splittedString === null || splittedString === void 0 ? void 0 : splittedString.forEach(function (value) {
        var connectionAndNumberString = value.match(/([ spc]*)?(\d+)/);
        if (connectionAndNumberString) {
            var parsedNumber = parseInt(connectionAndNumberString[2], 10);
            if (parsedNumber > 1024) {
                parsedNumber = 1024;
                document.getElementById('cap-warning').setAttribute('style', 'display: block;');
            }
            var continuation = connectionAndNumberString[1] ? connectionAndNumberString[1].indexOf('p') !== -1 : false;
            var square = connectionAndNumberString[1] ? connectionAndNumberString[1].indexOf('s') !== -1 : false;
            var newRow = connectionAndNumberString[1] ? connectionAndNumberString[1].indexOf('c') !== -1 : false;
            result.push({
                count: parsedNumber,
                continuation: continuation,
                square: square,
                newRow: newRow
            });
        }
        else {
            console.log('Invalid input: ' + value);
        }
    });
    return result;
}
function createAmountParts(partGroups, canvasHeight) {
    var result = [];
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
    var countOnRow = 0;
    var row = 0;
    var includedInContinuation = 0;
    var maxColorIndex = colors.length - 1;
    partGroups.forEach(function (partGroup, index) {
        if (!partGroup.continuation || partGroup.newRow)
            includedInContinuation = 0;
        if (partGroup.newRow) {
            row += 1;
            countOnRow = 0;
        }
        var parts = partGroup.continuation ? partGroup.count - includedInContinuation : partGroup.count;
        if (parts > 0) {
            var startColumn_1 = countOnRow;
            var squareStarted_1 = false;
            new Array(parts).fill(0).forEach(function (_, partIndex) {
                var colorIndex = index % maxColorIndex;
                if (partGroup.square && partIndex % Math.ceil(Math.sqrt(parts)) === 0) {
                    if (squareStarted_1) {
                        row += 1;
                    }
                    squareStarted_1 = true;
                    countOnRow = startColumn_1;
                }
                var amountPart = {
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
    var canvas = document.getElementById('ccc');
    if (canvas) {
        ctx = canvas.getContext('2d');
        var input = document.getElementById('formula');
        if (input)
            input.value = '3p6p10c3 6cs3cs25';
        width = canvas.width;
        height = canvas.height;
        // TODO add only if listener doesn't already exists
        input.addEventListener('input', function (ev) {
            var target = ev.target;
            // TODO update only changed partGroups when formula changes
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            amountParts = createAmountParts(parsePartGroups(target.value), height);
        });
        amountParts = createAmountParts(parsePartGroups(input.value), height);
        window.requestAnimationFrame(draw);
    }
    else {
        alert('Couldn\'t get canvas');
    }
}
