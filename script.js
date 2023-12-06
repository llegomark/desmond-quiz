let currentQuestionIndex = 0;
let questions = [];
let intervalId;
let score = 0;
let isAnimationPlaying = false;
let queuedAnimation = null;

// Confetti creation function
function createConfetti() {
  if (isAnimationPlaying) {
    queuedAnimation = createConfetti;
    return;
  }
  isAnimationPlaying = true;
  const confettiCount = 100;
  for (let i = 0; i < confettiCount; i += 1) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    document.body.appendChild(confetti);
  }

  setTimeout(() => {
    document.querySelectorAll('.confetti').forEach((confetti) => confetti.remove());
    isAnimationPlaying = false;
    if (queuedAnimation) {
      queuedAnimation();
      queuedAnimation = null;
    }
  }, 5000);
}

// Sad emoji creation function
function createFallingEmojis() {
  if (isAnimationPlaying) {
    queuedAnimation = createFallingEmojis;
    return;
  }
  isAnimationPlaying = true;
  const emojiCount = 100; // Number of emojis to create
  for (let i = 0; i < emojiCount; i += 1) {
    const emoji = document.createElement('div');
    emoji.classList.add('emoji');
    emoji.textContent = '😢'; // Sad emoji
    emoji.style.left = `${Math.random() * 100}%`;
    emoji.style.animationDuration = `${Math.random() * 3 + 2}s`;

    document.body.appendChild(emoji);
  }

  // Remove emojis after animation ends
  setTimeout(() => {
    document.querySelectorAll('.emoji').forEach((emoji) => emoji.remove());
    isAnimationPlaying = false;
    if (queuedAnimation) {
      queuedAnimation();
      queuedAnimation = null;
    }
  }, 5000);
}

// Fisher-Yates (Knuth) Shuffle
function shuffle(array) {
  const arr = [...array]; // Create a copy of the array
  let currentIndex = arr.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return arr;
}

// Function to handle answer selection
function selectAnswer(question, selected) {
  document.querySelectorAll('.answer-btn').forEach((originalButton) => {
    const button = originalButton.cloneNode(true);
    button.disabled = true;
    originalButton.parentNode.replaceChild(button, originalButton);
  });

  // Display explanation
  const explanationElement = document.getElementById('explanation');
  if (selected === question.correct) {
    explanationElement.innerText = `Correct! ${question.explanation}`;
    explanationElement.className = 'text-green-600 bg-green-100 p-4 rounded-lg border border-green-300 mt-4';
    createConfetti();
    // Increment the score for correct answer
    score += 1;
  } else {
    explanationElement.innerText = `Oops! The correct answer was ${question.choices[question.correct]}. ${question.explanation}`;
    explanationElement.className = 'text-red-600 bg-red-100 p-4 rounded-lg border border-red-300 mt-4';
    createFallingEmojis();
  }
  explanationElement.classList.remove('hidden');

  // Enable the next button
  const nextButton = document.getElementById('next-btn');
  nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
  nextButton.disabled = false;

  // Stop the timer
  clearInterval(intervalId);
}

// Function to display a question
function displayQuestion(question) {
  const questionElement = document.getElementById('question');
  questionElement.innerText = question.question;

  // Clear previous answers and display new ones
  const answersElement = document.getElementById('answers');
  answersElement.innerHTML = '';
  Object.entries(question.choices).forEach(([letter, text]) => {
    const button = document.createElement('button');
    button.className = 'answer-btn bg-purple-300 hover:bg-purple-400 text-white font-bold py-2 px-4 rounded transform transition duration-150 ease-out';
    button.innerText = `${text}`;
    button.addEventListener('click', () => selectAnswer(question, letter));
    answersElement.appendChild(button);
  });

  // Reset explanation and next button
  document.getElementById('explanation').classList.add('hidden');
  const nextButton = document.getElementById('next-btn');
  nextButton.classList.add('opacity-50', 'cursor-not-allowed');
  nextButton.disabled = true;
}

// Timer function
function startTimer() {
  clearInterval(intervalId);
  let timeLeft = 60;
  const timerElement = document.getElementById('timer');
  timerElement.innerText = `Time Remaining: ${timeLeft}s`;
  intervalId = setInterval(() => {
    timeLeft -= 1;
    timerElement.innerText = `Time Remaining: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      timerElement.innerText = "Time's up!";
      selectAnswer(questions[currentQuestionIndex], null);
    }
  }, 1000);
}

// Start the quiz
function startQuiz(quizQuestions) {
  // Shuffle questions
  questions = shuffle(quizQuestions).map((question) => {
    // Shuffle choices for each question
    const choices = Object.entries(question.choices);
    const shuffledChoices = shuffle(choices);

    // Return a new object with the shuffled choices
    return {
      ...question, // Spread the original question properties
      choices: Object.fromEntries(shuffledChoices), // Update the choices property
    };
  });

  currentQuestionIndex = 0;
  displayQuestion(questions[currentQuestionIndex]);
  startTimer();
}

// Complete the quiz
function completeQuiz() {
  clearInterval(intervalId);
  document.getElementById('question').innerText = '';
  document.getElementById('answers').innerHTML = '';
  document.getElementById('explanation').classList.add('hidden');

  // Hide the timer when the quiz is completed
  document.getElementById('timer').classList.add('hidden');

  // Hide the next button when the quiz is completed
  document.getElementById('next-btn').classList.add('hidden');

  // Calculate and show the score
  const scoreElement = document.getElementById('score');
  if (!scoreElement) {
    const appElement = document.getElementById('app');
    const newScoreElement = document.createElement('div');
    newScoreElement.id = 'score';
    newScoreElement.className = 'text-3xl font-bold text-gray-800 mb-7';
    newScoreElement.innerText = `Your Score: ${score}/${questions.length}`;
    appElement.insertBefore(newScoreElement, document.getElementById('restart-btn'));
  } else {
    scoreElement.innerText = `Your Score: ${score}/${questions.length}`;
    scoreElement.classList.remove('hidden');
  }

  // Determine completion message based on score
  let completionMessageText;
  const scorePercentage = (score / questions.length) * 100;

  if (scorePercentage >= 80) {
    completionMessageText = "Fantastic job! You're a quiz master!";
  } else if (scorePercentage >= 50) {
    completionMessageText = "Good effort! Keep practicing and you'll be at the top in no time!";
  } else {
    completionMessageText = 'Great attempt! Remember, every question is a new learning opportunity!';
  }

  // Show the completion message and restart button
  const completionMessage = document.getElementById('completion-message');
  if (!completionMessage) {
    const appElement = document.getElementById('app');
    const messageElement = document.createElement('div');
    messageElement.id = 'completion-message';
    messageElement.className = 'text-xl mb-4';
    messageElement.innerText = completionMessageText;
    appElement.insertBefore(messageElement, document.getElementById('restart-btn'));
  } else {
    completionMessage.innerText = completionMessageText;
    completionMessage.classList.remove('hidden');
  }
  document.getElementById('restart-btn').classList.remove('hidden');
}

// Go to next question
function goToNextQuestion() {
  // Clear any queued animation
  queuedAnimation = null;
  currentQuestionIndex += 1;
  if (currentQuestionIndex < questions.length) {
    displayQuestion(questions[currentQuestionIndex]);
    startTimer();
  } else {
    completeQuiz();
  }
}

// Restart the quiz
function restartQuiz() {
  // Hide the completion message and restart button
  document.getElementById('completion-message').classList.add('hidden');
  document.getElementById('restart-btn').classList.add('hidden');

  // Hide the score element
  const scoreElement = document.getElementById('score');
  if (scoreElement) {
    scoreElement.classList.add('hidden');
  }

  // Reset the score
  score = 0;

  // Reset the timer display
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.classList.remove('hidden');
  }

  // Reset the current question index and restart the quiz
  currentQuestionIndex = 0;

  // Ensure the next button is visible and reset
  const nextButton = document.getElementById('next-btn');
  nextButton.classList.remove('hidden', 'opacity-50', 'cursor-not-allowed');
  nextButton.disabled = true;

  // Restart the quiz with the initial set of questions
  startQuiz(questions);
}

// Event listeners
document.getElementById('next-btn').addEventListener('click', goToNextQuestion);
document.getElementById('restart-btn').addEventListener('click', restartQuiz);

// Fetch quiz data
fetch('quizdata.json')
  .then((response) => response.json())
  .then((quizQuestions) => {
    startQuiz(quizQuestions);
  });
