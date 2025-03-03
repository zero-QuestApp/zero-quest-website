// API für Benutzerauthentifizierung und Feedback-Verwaltung

// Benutzer abrufen
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

// Benutzer speichern
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Benutzer registrieren
function registerUser(name, email, password) {
  const users = getUsers();
  
  // Überprüfen, ob die E-Mail bereits existiert
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Diese Email-Adresse wird bereits verwendet.' };
  }
  
  // Neuen Benutzer erstellen
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password
  };
  
  // Benutzer speichern
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Registrierung erfolgreich!' };
}

// Benutzer anmelden
function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user && user.password === password) {
    // Erfolgreiche Anmeldung
    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    return { success: true, user: currentUser };
  }
  
  return { success: false, message: 'Ungültige Email oder Passwort.' };
}

// Aktuellen Benutzer abrufen
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Benutzer abmelden
function logoutUser() {
  localStorage.removeItem('currentUser');
  return { success: true };
}

// Kommentare abrufen
function getComments() {
  return JSON.parse(localStorage.getItem('comments')) || [];
}

// Kommentare speichern
function saveComments(comments) {
  localStorage.setItem('comments', JSON.stringify(comments));
}

// Kommentar hinzufügen
function addComment(text, rating) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: 'Nicht angemeldet.' };
  }
  
  const comments = getComments();
  
  const newComment = {
    id: Date.now().toString(),
    name: currentUser.name,
    userId: currentUser.id,
    text,
    rating,
    date: new Date().toISOString()
  };
  
  comments.unshift(newComment);
  saveComments(comments);
  
  return { success: true, comment: newComment };
}

// Passwort überprüfen
function verifyPassword(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user && user.password === password) {
    return { success: true };
  }
  
  return { success: false };
}
