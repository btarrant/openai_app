import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form submission behavior

  const data = new FormData(form);

  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from server => bot's response
  try {
    const response = await fetch("https://codecraft-wdtq.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const responseData = await response.json(); // Parse response as JSON
      console.log("Response from server:", responseData);

      // Check if responseData has the 'bot' property and it's not empty
      if (responseData && responseData.bot && responseData.bot.trim() !== "") {
        const parsedData = responseData.bot.trim();
        console.log({ parsedData });
        typeText(messageDiv, parsedData);
      } else {
        console.error("Invalid response format from server");
        messageDiv.innerHTML = "Something went wrong";
      }
    } else {
      const err = await response.text();
      console.error("Error from server:", err);
      messageDiv.innerHTML = "Something went wrong";
      alert(err);
    }
  } catch (error) {
    console.error("Error fetching data from server:", error);
    messageDiv.innerHTML = "Something went wrong";
  }
});

form.querySelector("textarea").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault(); // Prevent default Enter behavior
    const textarea = e.target;
    const cursorPosition = textarea.selectionStart;
    const value = textarea.value;
    textarea.value = value.substring(0, cursorPosition) + "\n" + value.substring(cursorPosition);
    textarea.setSelectionRange(cursorPosition + 1, cursorPosition + 1); // Move cursor to new line
  }
});

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
              />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}
