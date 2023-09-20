const backgroundMusic = document.getElementById('backgroundMusic');
var isTTS = ''

function handleSubmit(event) {
  event.preventDefault();
  const message = document.getElementById('input_text').value;
  sendMessage(message);
}

function sendMessage(message) {
  setTimeout(loadHistory, 300);

  if (isTTS.toString() == 'true') {
    message = message + '<tts>';
  }

  // Send a POST request to /send_message
  fetch('/send_message', {
      method: 'POST',
      body: new URLSearchParams({
        'message': message
      }), // Send the message as form data
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(response => response.json())
    .then(data => {
      // Display if ok
      loadHistory();
    })
    .catch(error => {
      console.error('Error sending message:', error);
    })
    .finally(() => {
      // This code will be executed regardless of success or error
      if (isTTS.toString() == 'true') {
        playAudio()
      }
      console.log('done');
    });
}

function playAudio() {
  stopSpeechRecognition()
  // Generate a random query parameter value
  const randomValue = Math.random();

  // Get the audio source element
  const audioSource = document.getElementById("backgroundMusic");

  // Set the src attribute with the random query parameter
  audioSource.src = `/static/audio/output.aiff?v=${randomValue}`;

  // Get the audio element and play it
  audio = document.getElementById("backgroundMusic");
  audio.load(); // Reload the audio element to apply the new source
  audio.play();
  startSpeechRecognition()
}

// Other functions (clearHistory, loadHistory, downloadHistory) go here if needed.
function formatMessage(messageData) {
  // Create a div for the message
  const messageDiv = document.createElement('div');

  // Set the CSS class based on the name
  if (messageData.name === 'Yuki') {
    messageDiv.classList.add('message-right'); // Yuki's messages on the right
  } else if (messageData.name === 'Yuna') {
    messageDiv.classList.add('message-left'); // Yuna's messages on the left
  }

  // Create a paragraph for the message text
  const messageText = document.createElement('p');
  messageText.textContent = `${messageData.name}: ${messageData.message}`;

  // Append the message text to the message div
  messageDiv.appendChild(messageText);

  return messageDiv;
}

function displayMessages(messages) {
  const messageContainer = document.getElementById('message-container');

  // Clear the existing content of messageContainer
  while (messageContainer.firstChild) {
    messageContainer.removeChild(messageContainer.firstChild);
  }

  // Loop through the messages and format each one
  messages.forEach(messageData => {
    const formattedMessage = formatMessage(messageData);
    messageContainer.appendChild(formattedMessage);
  });
}


// Function to fetch and display chat history
function loadHistory() {
  fetch('/history', {
      method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
      displayMessages(data); // Display the chat history
      scrollMsg()
    })
    .catch(error => {
      console.error('Error fetching history:', error);
    });
}

// Call loadHistory to initially load chat history
loadHistory();

// Get access to the user's camera and display the video stream
navigator.mediaDevices.getUserMedia({
    video: true
  })
  .then(function (stream) {
    const localVideo = document.getElementById('localVideo');
    localVideo.srcObject = stream;
  })
  .catch(function (error) {
    console.error('Error accessing the camera:', error);
  });

let recognition; // Define the recognition object at a higher scope

window.onload = function () {
  // Check if SpeechRecognition is supported by the browser
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    // Create a new SpeechRecognition object
    recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();

    // Configure recognition settings
    recognition.lang = 'en-US'; // Set the language for recognition
    recognition.interimResults = true; // Enable interim results
    recognition.continuous = true; // Enable continuous recognition

    // Variables to track previous recognized text
    let previousText = '';

    // Event listener for results
    recognition.onresult = function (event) {
      const result = event.results[event.resultIndex];
      const recognizedText = result[0].transcript;

      if (recognizedText === previousText) {
        console.log('Recognized Text:', recognizedText);
        sendMessage(recognizedText)
      }

      previousText = recognizedText;
    };

    // Event listener for errors
    recognition.onerror = function (event) {
      console.error('Speech recognition error:', event.error);
    };

    // Event listener for end of speech
    recognition.onend = function () {
      console.log('Speech recognition ended.');
    };

    // Start recognition
    document.getElementById('startButton').onclick = function () {
      startSpeechRecognition();
      isTTS = true;
      console.log('Recognition started.');
    };
  } else {
    console.error('SpeechRecognition not supported by the browser.');
  }
};

// Function to stop speech recognition
function stopSpeechRecognition() {
  if (recognition) {
    recognition.stop();
    isTTS = false; // Set isTTS to false when stopping recognition
    console.log('Speech recognition stopped.');
  }
}

// Function to start speech recognition
function startSpeechRecognition() {
  if (recognition) {
    // Start speech recognition
    recognition.start();
    isTTS = true;
    console.log('Speech recognition started.');
  }
}

function scrollMsg() {
  objDiv = document.getElementById("message-container");
  objDiv.scrollTop = objDiv.scrollHeight;
}