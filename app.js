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
const alphabet = "abcdefghijklmnopqrstuvqxyz";
let names = [];
let adjacentLetters = new Map();

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
    static pick ()
    {
        let one = randomSelection();
        if (lastMode == 2)
        {
            return new Pair(one, randomSelection(one, (s) => { return s[0] == one[0]; }));
        }
        else if (lastMode == 3)
        {
            return new Pair(one, randomSelection(one, (s) => { return adjacentLetters[one[0]].includes(s[0]); }));
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

function handleKeyPress (event) 
{
    if (event.key == "W")
        handleStartPress(0);
    if (event.key == "L")
        handleStartPress(1);
    if (event.key == "S")
        handleStartPress(2);
    if (event.key == " " || event.key == "Enter")
        handleStartPress(lastMode);
    if (begun)
    {
        for (i = 0; i < 2; i++)
            if (selectionKeys[i].includes(event.key)) 
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
    currentPair = Pair.pick();
    l1.textContent = currentPair.l1;
    l2.textContent = currentPair.l2;
}

function loadAdj (window = 2)
{
    for (int i = 0; i < 25; i++)
    {
        letters = [];
        for (int j = i - window; j < i + window; j++)
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
    left.style.display = "flex";
    right.style.display = "flex";
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
        left.style.display = "none";
        right.style.display = "none";
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
    document.addEventListener("keypress", handleKeyPress);
    start.addEventListener("click", () => {handleStartPress(lastMode)});
    left.addEventListener("click", () => {choose(0)});
    right.addEventListener("click", () => {choose(1)});
    
    let allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    timeIn.addEventListener("keypress", function (e) {
        if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key))
        {
            // Block if the key is not a number or whitelisted
            e.preventDefault();
        }
    });
}

main();
