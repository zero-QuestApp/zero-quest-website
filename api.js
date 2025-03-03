// API für Benutzerauthentifizierung, Blog und Feedback-Verwaltung

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
    password,
    isAdmin: false, // Standardmäßig ist ein neuer Benutzer kein Admin
    date: new Date().toISOString()
  };
  
  // Benutzer speichern
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Registrierung erfolgreich!' };
}

// Admin-Benutzer erstellen, falls noch keiner existiert
function initializeAdmin() {
  const users = getUsers();
  
  // Prüfen, ob bereits ein Admin existiert
  const adminExists = users.some(user => user.isAdmin);
  
  if (!adminExists) {
    // Admin-Benutzer erstellen
    const adminUser = {
      id: 'admin-' + Date.now().toString(),
      name: 'Admin',
      email: 'admin@zeroquest.com',
      password: 'admin123', // In einer echten Anwendung ein sicheres Passwort verwenden!
      isAdmin: true,
      date: new Date().toISOString()
    };
    
    users.push(adminUser);
    saveUsers(users);
    
    console.log('Admin-Benutzer erstellt:', adminUser.email, adminUser.password);
  }
}

// Admin-Benutzer initialisieren
initializeAdmin();

// Benutzer anmelden
function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user && user.password === password) {
    // Erfolgreiche Anmeldung
    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
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
    date: new Date().toISOString(),
    replies: []
  };
  
  comments.unshift(newComment);
  saveComments(comments);
  
  return { success: true, comment: newComment };
}

// Kommentar löschen
function deleteComment(commentId) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: 'Keine Berechtigung.' };
  }
  
  let comments = getComments();
  comments = comments.filter(comment => comment.id !== commentId);
  saveComments(comments);
  
  return { success: true };
}

// Antwort zu einem Kommentar hinzufügen
function addReplyToComment(commentId, text) {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: 'Nicht angemeldet.' };
  }
  
  const comments = getComments();
  const commentIndex = comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Kommentar nicht gefunden.' };
  }
  
  const newReply = {
    id: Date.now().toString(),
    name: currentUser.name,
    userId: currentUser.id,
    text,
    date: new Date().toISOString()
  };
  
  // Sicherstellen, dass das replies-Array existiert
  if (!comments[commentIndex].replies) {
    comments[commentIndex].replies = [];
  }
  
  comments[commentIndex].replies.push(newReply);
  saveComments(comments);
  
  return { success: true, reply: newReply };
}

// Antwort löschen
function deleteReply(commentId, replyId) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: 'Keine Berechtigung.' };
  }
  
  const comments = getComments();
  const commentIndex = comments.findIndex(comment => comment.id === commentId);
  
  if (commentIndex === -1) {
    return { success: false, message: 'Kommentar nicht gefunden.' };
  }
  
  if (!comments[commentIndex].replies) {
    return { success: false, message: 'Keine Antworten vorhanden.' };
  }
  
  comments[commentIndex].replies = comments[commentIndex].replies.filter(reply => reply.id !== replyId);
  saveComments(comments);
  
  return { success: true };
}

// Blog-Beiträge abrufen
function getBlogPosts() {
  return JSON.parse(localStorage.getItem('blogPosts')) || [];
}

// Blog-Beiträge speichern
function saveBlogPosts(posts) {
  localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Blog-Beitrag nach ID abrufen
function getBlogPostById(id) {
  const posts = getBlogPosts();
  return posts.find(post => post.id === id);
}

// Blog-Beitrag hinzufügen
function addBlogPost(title, content, image = null) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: 'Keine Berechtigung.' };
  }
  
  const posts = getBlogPosts();
  
  const newPost = {
    id: Date.now().toString(),
    title,
    content,
    author: currentUser.name,
    date: new Date().toISOString(),
    image
  };
  
  posts.unshift(newPost);
  saveBlogPosts(posts);
  
  return { success: true, post: newPost };
}

// Blog-Beitrag aktualisieren
function updateBlogPost(id, title, content, image = null) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: 'Keine Berechtigung.' };
  }
  
  const posts = getBlogPosts();
  const postIndex = posts.findIndex(post => post.id === id);
  
  if (postIndex === -1) {
    return { success: false, message: 'Beitrag nicht gefunden.' };
  }
  
  posts[postIndex].title = title;
  posts[postIndex].content = content;
  
  if (image !== null) {
    posts[postIndex].image = image;
  }
  
  saveBlogPosts(posts);
  
  return { success: true, post: posts[postIndex] };
}

// Blog-Beitrag löschen
function deleteBlogPost(id) {
  const currentUser = getCurrentUser();
  
  if (!currentUser || !currentUser.isAdmin) {
    return { success: false, message: 'Keine Berechtigung.' };
  }
  
  let posts = getBlogPosts();
  posts = posts.filter(post => post.id !== id);
  saveBlogPosts(posts);
  
  return { success: true };
}

// Beispiel-Blog-Beitrag erstellen, falls noch keiner existiert
function initializeBlogPosts() {
  const posts = getBlogPosts();
  
  if (posts.length === 0) {
    const examplePost = {
      id: '1',
      title: 'Willkommen bei Zero Quest',
      content: 'Willkommen in der Welt von Zero Quest!\n\nHier findest du alle Informationen zu unserem neuesten Projekt. Zero Quest ist eine immersive Erfahrung, die dich in eine neue Dimension entführt.\n\nBleib dran für weitere Updates und Einblicke hinter die Kulissen unserer Entwicklung.',
      author: 'Admin',
      date: new Date().toISOString(),
      image: null
    };
    
    posts.push(examplePost);
    saveBlogPosts(posts);
  }
}

// Beispiel-Blog-Beitrag initialisieren
initializeBlogPosts();

// Passwort überprüfen
function verifyPassword(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user && user.password === password) {
    return { success: true };
  }
  
  return { success: false };
}
