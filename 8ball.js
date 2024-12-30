class EightBall {
  possibleAnswers = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful",
  ];
  chatBoxElem = null;
  inputElem = null;

  constructor() {
    // me when
    this.respond = this.respond.bind(this);

    let container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = "10";
    container.style.width = "300px";
    container.style.height = "230px";
    container.style.left = `${window.innerWidth - 335}px`;
    container.style.top = `${window.innerHeight - 265}px`;
    container.style.padding = "10px";
    container.style.backgroundColor = "white";
    container.style.color = "black";
    container.style.borderColor = "blue";
    container.style.borderRadius = "16px";
    container.style.fontFamily = "Comic Sans, Comic Sans MS, cursive";

    // Web Development.
    let inputElemContainerWrapper = document.createElement("div");
    inputElemContainerWrapper.style.position = "absolute";
    inputElemContainerWrapper.style.bottom = container.style.height;
    let inputElemContainer = document.createElement("div");
    inputElemContainer.style.position = "sticky";
    inputElemContainer.style.display = "flex";
    inputElemContainer.style.flexDirection = "row";
    inputElemContainer.style.minWidth = "100%";

    let inputElem = document.createElement("input");
    inputElem.style.width = "85%";
    inputElem.placeholder = "ask 8-ball-gpt...";
    inputElem.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        this.respond();
      }
    });
    this.inputElem = inputElem;

    let button = document.createElement("button");
    button.innerHTML = "submit";
    button.addEventListener("click", this.respond);

    inputElemContainer.appendChild(inputElem);
    inputElemContainer.appendChild(button);

    let chatBoxElem = document.createElement("div");
    chatBoxElem.style.overflowY = "scroll";
    chatBoxElem.style.height = "90%";
    this.chatBoxElem = chatBoxElem;

    container.appendChild(chatBoxElem);
    container.appendChild(inputElemContainer);
    document.body.appendChild(container);
  }

  async respond() {
    let question = document.createElement("p");
    question.innerHTML = `you: ${this.inputElem.value}`;
    this.inputElem.value = "";
    this.chatBoxElem.appendChild(question);

    let answer = document.createElement("p");
    answer.innerHTML = "<span style=\"color: blue\">8-ball-gpt</span>: <em style=\"color: gray\">thinking...</em>";
    this.chatBoxElem.appendChild(answer);
    // let it Think.
    await new Promise(r => setTimeout(r, 1000));
    answer.remove();
    answer = document.createElement("p");
    answer.innerHTML = `<span style="color: blue">8-ball-gpt</span>: ${this.possibleAnswers[Math.floor(Math.random() * this.possibleAnswers.length)]}`;
    this.chatBoxElem.appendChild(answer);
  }
}

let _ = new EightBall();