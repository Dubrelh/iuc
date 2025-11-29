// ===============================
//  LISTE DES QUESTIONS
// ===============================
console.log("chat bot")
const questions = [
  "Qu'est-ce que le HTML ?",
  "Qu'est-ce que le CSS ?",
  "Qu'est-ce que le JavaScript ?",
  "Qu'est-ce que le PHP ?",
];

const reponses = {
  "Qu'est-ce que le HTML ?" : "Le HTML sert à structurer le contenu des pages web.",
  "Qu'est-ce que le CSS ?" : "Le CSS est utilisé pour mettre en forme le HTML.",
  "Qu'est-ce que le JavaScript ?" : "Le JavaScript rend les sites web interactifs.",
  "Qu'est-ce que le PHP ?" : "Le PHP est un langage serveur pour créer des sites dynamiques.",
};

// ===============================
//  AFFICHAGE DES QUESTIONS
// ===============================
const questionsDiv = document.getElementById('questions');
questions.forEach(q => {
  const btn = document.createElement('button');
  btn.textContent = q;
  btn.onclick = () => envoyerQuestion(q);
  questionsDiv.appendChild(btn);
});

// ===============================
//  FONCTION D’AFFICHAGE MESSAGE
// ===============================
function afficherMessage(message, type) {
  const chatBox = document.getElementById('chatBox');
  const container = document.createElement('div');
  container.classList.add('message-container');

  const msg = document.createElement('div');
  msg.classList.add('message', type);
  msg.textContent = message;

  const img = document.createElement('img');
  const profil = document.querySelector("#img-profil");
  img.classList.add('avatar');
  img.src = type === 'user'
    ? `${profil.src}` // image utilisateur
    : "../../assets/images/im2.png"; // image bot

  if (type === 'user') {
    container.appendChild(msg);
    container.appendChild(img);
  } else {
    container.appendChild(img);
    container.appendChild(msg);
  }

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
//  EFFET DE SAISIE (3 petits points)
// ===============================
function afficherTyping() {
  const chatBox = document.getElementById('chatBox');
  const typingContainer = document.createElement('div');
  typingContainer.classList.add('message-container', 'typing-container');

  const avatar = document.createElement('img');
  avatar.src = "../../assets/images/im2.png";
  avatar.classList.add('avatar');

  const typing = document.createElement('div');
  typing.classList.add('typing');
  typing.innerHTML = '<span></span><span></span><span></span>';

  typingContainer.appendChild(avatar);
  typingContainer.appendChild(typing);
  chatBox.appendChild(typingContainer);
  chatBox.scrollTop = chatBox.scrollHeight;

  return typingContainer;
}

// ===============================
//  ENVOYER QUESTION
// ===============================
function envoyerQuestion(question) {
  afficherMessage(question, 'user');

  const typing = afficherTyping();

  setTimeout(() => {
    typing.remove();
    afficherMessage(reponses[question] || " cette reponse n'est pas encore disponible merci pour la soumission 😊 ", 'bot');
  }, 1500);
}
