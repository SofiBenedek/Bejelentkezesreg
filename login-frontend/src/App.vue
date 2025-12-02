<template>
  <div class="app">
    <h1>Bejelentkezés / Regisztráció</h1>

    <div class="tabs">
      <button
        :class="{ active: mode === 'login' }"
        @click="switchMode('login')"
      >
        Bejelentkezés
      </button>
      <button
        :class="{ active: mode === 'register' }"
        @click="switchMode('register')"
      >
        Regisztráció
      </button>
    </div>

    <form @submit.prevent="onSubmit">
      <div>
        <label for="email">Email:</label>
        <input
          id="email"
          type="email"
          v-model="email"
          placeholder="pl. teszt@pelda.hu"
        />
      </div>

      <div>
        <label for="password">Jelszó:</label>
        <input
          id="password"
          type="password"
          v-model="password"
          placeholder="jelszó"
        />
      </div>

      <button type="submit">
        {{ mode === "login" ? "Belépés" : "Regisztráció" }}
      </button>
    </form>

    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const mode = ref("login"); // "login" vagy "register"
const email = ref("");
const password = ref("");
const message = ref("");

const switchMode = (newMode) => {
  mode.value = newMode;
  message.value = "";
};

const onSubmit = async () => {
  message.value = "";

  const url =
    mode.value === "login"
      ? "http://localhost:3000/login"
      : "http://localhost:3000/register";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      message.value = data || "Hiba történt";
      return;
    }

    // Ha LOGIN módban vagyunk: ÁTIRÁNYÍTÁS MÁS OLDALRA
    if (mode.value === "login") {
      // /public mappából fogjuk kiszolgálni a success.html-t
      window.location.href =
        "/success.html?email=" + encodeURIComponent(data.user.email);
      return;
    }

    // Ha REGISZTRÁCIÓ módban vagyunk: maradunk itt, csak kiírjuk az üzenetet
    message.value = `✅ ${data.message} (${data.user.email})`;
  } catch (err) {
    message.value = "Hálózati hiba (nem fut a backend?)";
  }
};
</script>

<style>
.app {
  max-width: 400px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: Arial, sans-serif;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tabs button {
  flex: 1;
  padding: 6px 8px;
  cursor: pointer;
}

.tabs button.active {
  font-weight: bold;
  border-bottom: 2px solid black;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 6px 8px;
  width: 100%;
}

button[type="submit"] {
  padding: 6px 8px;
  cursor: pointer;
}
</style>
