const instructions = document.getElementById("instruction");
const playInstructions = document.getElementById("instruction2");
const score = document.getElementById("score");
const history = document.getElementById("history");
const l1 = document.getElementById("l1");
const l2 = document.getElementById("l2");
const clock = document.getElementById("time");
const start = document.getElementById("start");
const left = document.getElementById("leftChoice");
const right = document.getElementById("rightChoice");
const timeIn = document.getElementById("timeIn");
const timeSet = document.getElementById("timeSet");

let allottment = 30;
const selectionKeys = [["ArrowLeft", "1"], ["ArrowRight", "2"]];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let names = [];
let adjacentLetters;
let lockoutMap;

let pool = [];
let begun = false;
let runningScore, attempts, runningTime;
let currentInterval;
let currentPair;
let lastMode = 3;

class Pair
{
    constructor (l1, l2)
    {
        this.l1 = l1;
        this.l2 = l2;
        this.result = false;
        this.choice = 0;
        this.lesser = (l1 < l2) ? 0 : 1;
    }
    static pick (mode)
    {
        let one = randomSelection();
        if (mode == 2)
        {
            return new Pair(one, randomSelection(one, (s) => { return s[0] == one[0] && adjacentLetters.get(one[1]).includes(s[1]); }));
        }
        else if (mode == 3)
        {
            return new Pair(one, randomSelection(one, (s) => { return adjacentLetters.get(one[0]).includes(s[0]); }));
        }
        else if (mode == 4)
        {
            let names = Pair.pick(3);
            let num1 = randomDewey();
            let num2 = randomDewey(num1);
            return new Pair(num1 + " " + names.l1, num2 + " " + names.l2);
        }
        else if (mode == 5)
        {
            return Math.random() < 0.5 ? Pair.pick(3) : Pair.pick(4);
        }
        else
            return new Pair(one, randomSelection(one));
    }
}

function randomSelection (exception = "", predicate = null)
{
    let tempPool = pool;
    if (predicate != null)
        tempPool = pool.filter(predicate);
    let choice = tempPool[Math.ceil(Math.random() * (tempPool.length - 1))];
    while (choice == exception)
    {
        choice = tempPool[Math.ceil(Math.random() * (tempPool.length - 1))];
    }
    return choice;
}

function randomDewey (base = "")
{
    let num;
    if (base == "")
        num = Math.ceil(Math.random() * 999) + ((Math.random() < .3 ? 0 : Math.ceil(Math.random() * 1000)) / 1000);
    else
    {
        base = parseFloat(base);
        let code = Math.random();
        if (code < 0.1)
            num = base + Math.ceil((0.5 - Math.random()) * 100) / 100;
        else if (code < 0.3)
        	num = base + Math.ceil(30 * (0.5 - Math.random()));
        else if (code < 0.55)
            num = base;
        else
        	num = base + Math.ceil(300 * (0.5 - Math.random())) / 10;
    }
    if (num >= 1000)
            num = 628.318; //tau :)
    let out = num.toString();
    if (num < 100)
    	out = "0" + out;
    if (num < 10)
    	out = "0" + out;
    return out.slice(0, 7);
}

function handleKeyPress (event) 
{
    let spaced = event.code == "Space";
    if (spaced)
        e.preventDefault();
    if (lockoutMap.get(event.code))
        return;
    lockoutMap.set(event.code, true);
    if (event.key.toUpperCase() == "U")
        handleStartPress(0);
    if (event.key.toUpperCase() == "L")
        handleStartPress(1);
    if (event.key.toUpperCase() == "S")
        handleStartPress(2);
    if (event.key.toUpperCase() == "D")
        handleStartPress(3);
    if (event.key.toUpperCase() == "N")
        handleStartPress(4);
    if (event.key.toUpperCase() == "M")
        handleStartPress(5);
    if (spaced || event.code == "Enter")
        handleStartPress(lastMode);
    if (begun)
    {
        for (i = 0; i < 2; i++)
            if (selectionKeys[i].includes(event.key) || selectionKeys[i].includes(event.code)) 
            {
                choose(i, currentPair);
        }
    }
}

function choose (code)
{
    attempts++;
    currentPair.result = code == currentPair.lesser;
    if (currentPair.result)
        runningScore++;
    currentPair.choice = code;
    score.textContent = runningScore + "/" + attempts;
    updateHistory(currentPair);
    scrambleCurrentPair();
}

function updateHistory (pair)
{
    let string = pair.l1 + ([" before ", " after "][pair.choice]) + pair.l2 + "; " + (pair.result ? "correct!" : "incorrect");
    let el = document.createElement("li");
    el.appendChild(document.createTextNode(string));
    history.appendChild(el);
}

function scrambleCurrentPair ()
{
    currentPair = Pair.pick(lastMode);
    l1.textContent = currentPair.l1;
    l2.textContent = currentPair.l2;
}

function loadAdj (window = 3)
{
    adjacentLetters = new Map();
    for (i = 0; i < 25; i++)
    {
        letters = [];
        for (j = i - window; j <= i + window; j++)
        {
            if ((j < 0) || (j > 25))
                continue;
            letters.push(alphabet[j]);
        }
        adjacentLetters.set(alphabet[i], letters);
    }
}

function handleStartPress (mode = 0)
{
    history.innerHTML = "";
    attempts = 0;
    runningScore = 0;

    allottment = parseInt(timeIn.value);
    if (timeIn.value == "" || allottment == 0)
        allottment = 30;
    runningTime = allottment + 1;
    tick();
    clearInterval(currentInterval);
    pool = names;
    if (mode == 1)
        pool = alphabet;
    lastMode = mode;

    instructions.textContent = "Press spacebar to restart";
    timeIn.style.display = "none";
    start.textContent = "Restart";
    timeSet.textContent = allottment + "-second round";
    score.textContent = "0/0";

    document.getElementById("historyContainer").style.display = "flex";
    score.style.display = "flex";
    timeSet.style.display = "flex";
    playInstructions.style.display = "flex";
    l1.style.display = "flex";
    l2.style.display = "flex";
    //left.style.display = "flex";
    //right.style.display = "flex";
    scrambleCurrentPair();
    begun = true;
    currentInterval = setInterval(tick, 1000);
}

function tick ()
{
    if (runningTime == 0)
    {
        begun = false;
        clearInterval(currentInterval);
        timeIn.style.display = "flex";
        l1.style.display = "none";
        l2.style.display = "none";
        playInstructions.style.display = "none";
        //left.style.display = "none";
        //right.style.display = "none";
        return;
    }
    runningTime --;
    let seconds = runningTime % 60;
    clock.textContent = Math.floor(runningTime / 60) + ":" + ((seconds / 10 < 1) ? "0" : "") + seconds;
}

async function main()
{
    let temp = "";
    await fetch("./last-names.txt").then(response => response.text()).then(str => temp = str);;
    names = temp.split("\n");
    loadAdj();
    lockoutMap = new Map();
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("keyup", (event) => { lockoutMap.delete(event.code) });
    start.addEventListener("click", () => {handleStartPress(lastMode)});
    l1.addEventListener("click", () => {choose(0)});
    l2.addEventListener("click", () => {choose(1)});
    
    let allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    timeIn.addEventListener("keypress", function (e) {
        if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key))
            e.preventDefault();
    });
}

main();