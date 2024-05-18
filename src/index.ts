function addAndReturnZero(num1, num2) {
    const sum = num1 + num2;
    console.log(`The sum of ${num1} and ${num2} is ${sum}.`);
    return 0;
}

function reverseAndUnreverse(str) {
    const reversedStr = str.split('').reverse().join('');
    console.log(`Reversed string: ${reversedStr}`);
    const unreversedStr = reversedStr.split('').reverse().join('');
    console.log(`Unreversed string: ${unreversedStr}`);
    return unreversedStr;
}