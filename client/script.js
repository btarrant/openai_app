import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

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

const handleSubmit = async (e) => {
  e.preventDefault();

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
};

// Add touchstart event listener for form submission
form.addEventListener("touchstart", (e) => {
  handleSubmit(e);
});

// Modify the keyup event listener to handle both keyboard and touch events
// Add touchend event listener to prevent default touch behavior
form.addEventListener("touchend", (e) => {
  e.preventDefault(); // Prevent default touch behavior
});

// Add touchstart event listener for form submission
form.addEventListener("touchstart", (e) => {
  e.preventDefault(); // Prevent default touch behavior
  handleSubmit(e); // Call handleSubmit function
});

// Modify the keyup event listener to handle both keyboard and touch events
form.addEventListener("keyup", (e) => {
  if (e.shiftKey && e.keyCode === 13) {
    // If Shift+Enter is pressed, add a new line instead of submitting the form
    const textArea = e.target;
    const currentPosition = textArea.selectionStart;
    const currentValue = textArea.value;

    const newValue =
      currentValue.substring(0, currentPosition) + "\n" + currentValue.substring(currentPosition);

    textArea.value = newValue;
    textArea.setSelectionRange(currentPosition + 1, currentPosition + 1);
  } else if (e.keyCode === 13) {
    // If only Enter is pressed, submit the form
    handleSubmit(e);
  }
});
