// Hilfsfunktionen für die Speicherung im Local Storage
function getFromLocalStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Fehler beim Laden von ${key}:`, error);
    return defaultValue;
  }
}

function saveToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`${key} erfolgreich gespeichert:`, data);
    return true;
  } catch (error) {
    console.error(`Fehler beim Speichern von ${key}:`, error);
    return false;
  }
}

// Benutzer-Funktionen
function getUsers() {
  return getFromLocalStorage('zeroquest_users', []);
}

function saveUsers(users) {
  return saveToLocalStorage('zeroquest_users', users);
}

function getUserByEmail(email) {
  const users = getUsers();
  return users.find(user => user.email === email);
}

function getUserById(id) {
  const users = getUsers();
  return users.find(user => user.id === id);
}

function registerUser(name, email, password) {
  const users = getUsers();
  
  // Prüfen, ob die E-Mail bereits existiert
  if (users.some(user => user.email === email)) {
    return { success: false, message: 'Diese E-Mail-Adresse wird bereits verwendet.' };
  }
  
  // Neuen Benutzer erstellen
  const newUser = {
    id: 'user-' + Date.now(),
    name,
    email,
    password, // In einer echten Anwendung sollte das Passwort gehasht sein
    isAdmin: false
  };
  
  // Benutzer hinzufügen
  users.push(newUser);
  
  // Benutzer speichern
  if (saveUsers(users)) {
    return { success: true, user: newUser };
  } else {
    return { success: false, message: 'Fehler beim Speichern des Benutzers.' };
  }
}

function loginUser(email, password) {
  const user = getUserByEmail(email);
  
  if (!user) {
    return { success: false, message: 'Benutzer nicht gefunden.' };
  }
  
  if (user.password !== password) {
    return { success: false, message: 'Falsches Passwort.' };
  }
  
  // Benutzer in der Session speichern
  sessionStorage.setItem('currentUser', JSON.stringify(user));
  
  return { success: true, user };
}

function getCurrentUser() {
  try {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Fehler beim Laden des aktuellen Benutzers:', error);
    return null;
  }
}

function logoutUser() {
  sessionStorage.removeItem('currentUser');
}

// Blog-Funktionen
function getBlogPosts() {
  return getFromLocalStorage('zeroquest_blog_posts', []);
}

function saveBlogPosts(posts) {
  return saveToLocalStorage('zeroquest_blog_posts', posts);
}

function getBlogPostById(id) {
  const posts = getBlogPosts();
  return posts.find(post => post.id === id);
}

function addBlogPost(title, content, image = null) {
  if (!title || !content) {
    return { success: false, message: 'Titel und Inhalt sind erforderlich.' };
  }
  
  const posts = getBlogPosts();
  
  // Neuen Beitrag erstellen
  const newPost = {
    id: 'post-' + Date.now(),
    title,
    content,
    image,
    date: new Date().toISOString(),
    author: getCurrentUser()?.name || 'Admin'
  };
  
  // Beitrag hinzufügen
  posts.push(newPost);
  
  // Beiträge speichern
  if (saveBlogPosts(posts)) {
    console.log('Blog-Beitrag erfolgreich gespeichert:', newPost);
    return { success: true, post: newPost };
  } else {
    return { success: false, message: 'Fehler beim Speichern des Beitrags.' };
  }
}

function updateBlogPost(id, title, content, image = null) {
  if (!id || !title || !content) {
    return { success: false, message: 'ID, Titel und Inhalt sind erforderlich.' };
  }
  
  const posts = getBlogPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return { success: false, message: 'Beitrag nicht gefunden.' };
  }
  
  // Beitrag aktualisieren
  posts[postIndex] = {
    ...posts[postIndex],
    title,
    content,
    image,
    lastUpdated: new Date().toISOString()
  };
  
  // Beiträge speichern
  if (saveBlogPosts(posts)) {
    console.log('Blog-Beitrag erfolgreich aktualisiert:', posts[postIndex]);
    return { success: true, post: posts[postIndex] };
  } else {
    return { success: false, message: 'Fehler beim Aktualisieren des Beitrags.' };
  }
}

function deleteBlogPost(id) {
  const posts = getBlogPosts();
  const newPosts = posts.filter(post => post.id !== id);
  
  if (newPosts.length === posts.length) {
    return { success: false, message: 'Beitrag nicht gefunden.' };
  }
  
  // Beiträge speichern
  if (saveBlogPosts(newPosts)) {
    console.log('Blog-Beitrag erfolgreich gelöscht:', id);
    return { success: true };
  } else {
    return { success: false, message: 'Fehler beim Löschen des Beitrags.' };
  }
}

// Kommentar-Funktionen
function getComments() {
  return getFromLocalStorage('zeroquest_comments', []);
}

function saveComments(comments) {
  return saveToLocalStorage('zeroquest_comments', comments);
}

function addComment(name, text, rating) {
  if (!name || !text || !rating) {
    return { success: false, message: 'Name, Text und Bewertung sind erforderlich.' };
  }
  
  const comments = getComments();
  
  // Neuen Kommentar erstellen
  const newComment = {
    id: 'comment-' + Date.now(),
    name,
    text,
    rating: parseInt(rating),
    date: new Date().toISOString(),
    replies: []
  };
  
  // Kommentar hinzufügen
  comments.push(newComment);
  
  // Kommentare speichern
  if (saveComments(comments)) {
    return { success: true, comment: newComment };
  } else {
    return { success: false, message: 'Fehler beim Speichern des Kommentars.' };
  }
}

function deleteComment(id) {
  const comments = getComments();
  const newComments = comments.filter(comment => comment.id !== id);
  
  if (newComments.length === comments.length) {
    return { success: false, message: 'Kommentar nicht gefunden.' };
  }
  
  // Kommentare speichern
  if (saveComments(newComments)) {
    return { success: true };
  } else {
    return { success: false, message: 'Fehler beim Löschen des Kommentars.' };
  }
}

function addReply(commentId, name, text) {
  if (!commentId || !name || !text) {
    return { success: false, message: 'Kommentar-ID, Name und Text sind erforderlich.' };
  }
  
  const comments = getComments();
  const commentIndex = comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Kommentar nicht gefunden.' };
  }
  
  // Neue Antwort erstellen
  const newReply = {
    id: 'reply-' + Date.now(),
    name,
    text,
    date: new Date().toISOString()
  };
  
  // Antwort hinzufügen
  if (!comments[commentIndex].replies) {
    comments[commentIndex].replies = [];
  }
  
  comments[commentIndex].replies.push(newReply);
  
  // Kommentare speichern
  if (saveComments(comments)) {
    return { success: true, reply: newReply };
  } else {
    return { success: false, message: 'Fehler beim Speichern der Antwort.' };
  }
}

function deleteReply(commentId, replyId) {
  const comments = getComments();
  const commentIndex = comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1 || !comments[commentIndex].replies) {
    return { success: false, message: 'Kommentar oder Antworten nicht gefunden.' };
  }
  
  const originalLength = comments[commentIndex].replies.length;
  comments[commentIndex].replies = comments[commentIndex].replies.filter(reply => reply.id !== replyId);
  
  if (comments[commentIndex].replies.length === originalLength) {
    return { success: false, message: 'Antwort nicht gefunden.' };
  }
  
  // Kommentare speichern
  if (saveComments(comments)) {
    return { success: true };
  } else {
    return { success: false, message: 'Fehler beim Löschen der Antwort.' };
  }
}

// Initialisierungsfunktion für Admin-Benutzer
function initializeAdmin() {
  const users = getUsers();
  
  // Prüfen, ob bereits ein Admin existiert
  const adminExists = users.some(user => user.isAdmin);
  
  if (!adminExists && users.length > 0) {
    // Den ersten Benutzer zum Admin machen
    users[0].isAdmin = true;
    saveUsers(users);
    console.log("Erster Benutzer wurde zum Admin gemacht:", users[0].name);
    return true;
  } else if (!adminExists && users.length === 0) {
    // Standard-Admin erstellen, falls keine Benutzer existieren
    const defaultAdmin = {
      id: "admin-" + Date.now(),
      name: "Administrator",
      email: "admin@zeroquest.de",
      password: "admin123", // In einer echten Anwendung sollte das Passwort gehasht sein
      isAdmin: true
    };
    
    users.push(defaultAdmin);
    saveUsers(users);
    console.log("Standard-Admin wurde erstellt");
    return true;
  }
  
  return false;
}

// Debugging-Funktion zum Anzeigen aller gespeicherten Daten
function showStorageDebug() {
  console.log("=== STORAGE DEBUG ===");
  console.log("Users:", getUsers());
  console.log("Current User:", getCurrentUser());
  console.log("Blog Posts:", getBlogPosts());
  console.log("Comments:", getComments());
  console.log("=== END DEBUG ===");
}

// Initialisiere die Daten beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
  // Initialisiere Admin, falls nötig
  initializeAdmin();
  
  // Debug-Ausgabe
  showStorageDebug();
});
