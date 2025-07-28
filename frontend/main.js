const API_URL = "http://localhost:5000/api";
const BASE_URL = API_URL.replace("/api", "");
const token = localStorage.getItem("token");

/* =======================================
   🔐 AUTH FUNCTIONS
======================================= */

async function register() {
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !email || !password) return alert("All fields are required!");

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (!data.error) window.location.href = "login.html";
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) return alert("Enter email and password!");

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);
    window.location.href = "index.html";
  } else {
    alert(data.error);
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/* =======================================
   📝 POST FUNCTIONS
======================================= */

async function createPost() {
  const content = document.getElementById("content").value.trim();
  const file = document.getElementById("media")?.files[0];

  if (!content && !file) return alert("Post cannot be empty!");

  const formData = new FormData();
  formData.append("content", content);
  if (file) formData.append("media", file);

  await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  document.getElementById("content").value = "";
  if (document.getElementById("media")) document.getElementById("media").value = "";
  loadPosts();
}

async function loadPosts() {
  const res = await fetch(`${API_URL}/posts`);
  const posts = await res.json();

  const postContainer = document.getElementById("posts");
  if (!postContainer) return;

  postContainer.innerHTML = "";

  const currentUser = localStorage.getItem("userId");

  posts.reverse().forEach((p) => {
    const isLiked = p.likes.includes(currentUser);

    // ✅ Media (image/video)
    let mediaHTML = "";
    if (p.mediaUrl) {
      const fileUrl = `${BASE_URL}${p.mediaUrl}`;
      mediaHTML = p.mediaType.startsWith("image")
        ? `<img src="${fileUrl}" style="max-width:100%;border-radius:8px;margin-top:10px;">`
        : `<video controls style="max-width:100%;border-radius:8px;margin-top:10px;">
             <source src="${fileUrl}" type="video/mp4">
           </video>`;
    }

    // ✅ Profile Picture or First Letter Circle
    const userPic = p.user.profilePic
      ? `<img src="${BASE_URL}${p.user.profilePic}" style="width:35px;height:35px;border-radius:50%;object-fit:cover;">`
      : `<div style="width:35px;height:35px;border-radius:50%;background:#1877f2;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;">
           ${p.user.username[0].toUpperCase()}
         </div>`;

    postContainer.innerHTML += `
      <div class="post-card">
        <div class="post-header" style="display:flex;align-items:center;gap:8px;">
          ${userPic}
          <a href="profile.html?id=${p.user._id}">${p.user.username}</a>
        </div>

        <div class="post-content">${p.content}</div>
        ${mediaHTML}

        <div class="post-actions">
          <button class="like-btn ${isLiked ? "liked" : ""}" onclick="likePost('${p._id}')">
            <span style="color:red;">&#10084;</span> ${p.likes.length}
          </button>

          <a href="profile.html?id=${p.user._id}">
            <button>View Profile</button>
          </a>
        </div>

        <div class="comment-section">
          <input id="comment-input-${p._id}" placeholder="Add a comment...">
          <button onclick="addComment('${p._id}')">Comment</button>
        </div>

        <div id="comments-${p._id}" class="comments-list"></div>
      </div>
    `;

    showComments(p._id);
  });
}

async function likePost(id) {
  await fetch(`${API_URL}/posts/${id}/like`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  loadPosts();
}

/* =======================================
   💬 COMMENTS
======================================= */

async function showComments(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`);
  const comments = await res.json();

  document.getElementById(`comments-${postId}`).innerHTML = comments
    .map(
      (c) => {
        const avatar = c.user.profilePic
          ? `<img src="${BASE_URL}${c.user.profilePic}" style="width:25px;height:25px;border-radius:50%;object-fit:cover;margin-right:5px;">`
          : `<div style="width:25px;height:25px;border-radius:50%;background:#1877f2;color:white;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:5px;">
               ${c.user.username[0].toUpperCase()}
             </div>`;

        return `<p style="display:flex;align-items:center;gap:5px;">${avatar}<strong>${c.user.username}:</strong> ${c.text}</p>`;
      }
    )
    .join("");
}

async function addComment(postId) {
  const text = document.getElementById(`comment-input-${postId}`).value.trim();
  if (!text) return;

  await fetch(`${API_URL}/posts/${postId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  document.getElementById(`comment-input-${postId}`).value = "";
  showComments(postId);
}

/* =======================================
   👤 PROFILE
======================================= */

async function loadProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileId = urlParams.get("id") || localStorage.getItem("userId");

  const res = await fetch(`${API_URL}/users/${profileId}`);
  const user = await res.json();

  if (document.getElementById("username")) {
    document.getElementById("username").textContent = user.username;
    document.getElementById("bio").textContent = user.bio;
    document.getElementById("followers").textContent = user.followers.length;
    document.getElementById("following").textContent = user.following.length;

    // ✅ Followers
    document.getElementById("followers-list").innerHTML = user.followers
      .map(
        (f) => {
          const avatar = f.profilePic
            ? `<img src="${BASE_URL}${f.profilePic}" style="width:25px;height:25px;border-radius:50%;object-fit:cover;margin-right:5px;">`
            : `<div style="width:25px;height:25px;border-radius:50%;background:#1877f2;color:white;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:5px;">
                 ${f.username[0].toUpperCase()}
               </div>`;

          return `<li style="display:flex;align-items:center;gap:5px;">${avatar}<a href="profile.html?id=${f._id}">${f.username}</a></li>`;
        }
      )
      .join("");

    // ✅ Following
    document.getElementById("following-list").innerHTML = user.following
      .map(
        (f) => {
          const avatar = f.profilePic
            ? `<img src="${BASE_URL}${f.profilePic}" style="width:25px;height:25px;border-radius:50%;object-fit:cover;margin-right:5px;">`
            : `<div style="width:25px;height:25px;border-radius:50%;background:#1877f2;color:white;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;margin-right:5px;">
                 ${f.username[0].toUpperCase()}
               </div>`;

          return `<li style="display:flex;align-items:center;gap:5px;">${avatar}<a href="profile.html?id=${f._id}">${f.username}</a></li>`;
        }
      )
      .join("");
  }

  if (profileId !== localStorage.getItem("userId")) {
    const currentUserId = localStorage.getItem("userId");
    const isFollowing = user.followers.some((f) => f._id === currentUserId);

    const followBtn = document.getElementById("follow-btn");
    if (followBtn) {
      followBtn.innerHTML = `<button onclick="followUser('${profileId}')">
        ${isFollowing ? "Unfollow" : "Follow"}
      </button>`;
    }
  }
}

async function followUser(id) {
  const res = await fetch(`${API_URL}/users/${id}/follow`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("Follow API Response:", await res.json());
  loadProfile();
}

/* =======================================
   🚀 INIT
======================================= */

if (window.location.pathname.endsWith("index.html")) loadPosts();
if (window.location.pathname.endsWith("profile.html")) loadProfile();
