const instructions = document.getElementById("instruction");
const score = document.getElementById("score");
const history = document.getElementById("history");
const l1 = document.getElementById("l1");
const l2 = document.getElementById("l2");
const clock = document.getElementById("time");

const allottment = 30;
const selectionKeys = [["ArrowLeft", "1"], ["ArrowRight", "2"]];
const alphabet = "abcdefghijklmnopqrstuvqxyz";

let begun = false;
let runningScore, attempts, runningTime;
let currentInterval;

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
    static gen () 
    {
        let one = randomLetter();
        return new Pair(one, randomLetter(one));
    }
}

let currentPair = Pair.gen();

function randomLetter (exception = "")
{
    let choice = alphabet[Math.ceil(Math.random() * 25)];
    while (choice == exception)
    {
        choice = alphabet[Math.ceil(Math.random() * 25)];
    }
    return choice;
}

document.addEventListener("keydown", handleKeyPress);

function handleKeyPress (event) 
{
    if (event.key === " ")
    {
        history.innerHTML = "";
        attempts = 0;
        runningScore = 0;
        runningTime = allottment + 1;
        tick();
        clearInterval(currentInterval);
        instructions.textContent = "Press spacebar to restart";
        score.style.display = "flex";
        document.getElementById("historyContainer").style.display = "flex";
        l1.style.display = "flex";
        l2.style.display = "flex";
        scrambleCurrentPair();
        begun = true;
        currentInterval = setInterval(tick, 1000);
    }
    if (begun)
    {
        for (i = 0; i < 2; i++)
            if (selectionKeys[i].includes(event.key)) 
            {
                choose(i, currentPair);
        }
        score.textContent = runningScore + "/" + attempts;
    }
}

function choose (code, pair)
{
    attempts++;
    pair.result = code == pair.lesser;
    if (pair.result)
        runningScore++;
    pair.choice = code;
    updateHistory(pair);
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
    currentPair = Pair.gen();
    l1.textContent = currentPair.l1;
    l2.textContent = currentPair.l2;
}

function tick ()
{
    if (runningTime == 0)
    {
        begun = false;
        clearInterval(currentInterval);
    }
    runningTime --;
    clock.textContent = Math.floor(runningTime / 60) + ":" + runningTime % 60;
}