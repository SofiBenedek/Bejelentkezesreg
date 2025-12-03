<template>
  <div class="container my-4">
    <h1 class="mb-4">Étterem app</h1>

    <!-- NINCS BEJELENTKEZVE -->
    <div v-if="!user" class="card p-4 mb-4 shadow-sm border-primary border-2 rounded-3">


      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: mode === 'login' }"
            @click="mode = 'login'"
          >
            Bejelentkezés
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: mode === 'register' }"
            @click="mode = 'register'"
          >
            Regisztráció
          </button>
        </li>
      </ul>

      <form @submit.prevent="submitAuth">
        <div class="mb-2">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control form-control-lg border-primary" />

        </div>
        <div class="mb-2">
          <label class="form-label">Jelszó</label>
          <input v-model="password" type="password" class="form-control form-control-lg border-primary" />

        </div>
        <button class="btn btn-primary mt-2">
          {{ mode === "login" ? "Belépés" : "Regisztráció" }}
        </button>
      </form>

      <p v-if="msg" class="mt-2 text-danger">{{ msg }}</p>
    </div>

    <!-- BEJELENTKEZVE -->
    <div v-else class="border border-primary border-2 rounded-3 p-4">

      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          Bejelentkezve: <strong>{{ user.email }}</strong>
          <span
            v-if="user.role === 'admin'"
            class="badge bg-secondary ms-1"
            >admin</span
          >
        </div>
        <button class="btn btn-outline-secondary btn-sm" @click="logout">
          Kilépés
        </button>
      </div>

      <div class="row">
        <!-- ÉTTERMEK LISTA -->
        <div class="col-md-5">
          <div class="d-flex justify-content-between mb-2">
            <h5>Éttermek</h5>
            <button
              class="btn btn-sm btn-outline-primary  "
              @click="loadRestaurants"
            >
              Frissítés
            </button>
          </div>
          <ul class="list-group shadow-sm border border-primary border-2 rounded-3 p-2">

           <li
  v-for="r in restaurants"
  :key="r.id"
  class="list-group-item list-group-item-action"
  :class="{ active: selected && selected.id === r.id }"
  @click="selectRestaurant(r.id)"
>
  <div class="fw-bold">{{ r.name }}</div>
  <small>{{ r.location }}</small><br />

  <small v-if="r.review_count > 0">
    Átlag: {{ (r.average_rating || 0).toFixed(1) }}/5 ({{ r.review_count }} értékelés)
  </small>
  <small v-else class="text-muted">
    Legyél az első értékelő!
  </small>

  <!-- TÖRLÉS GOMB ADMINNAK -->
  <div v-if="user.role === 'admin'" class="mt-1">
    <button
      class="btn btn-sm btn-danger"
      @click.stop="deleteRestaurant(r.id)"
    >
      Törlés
    </button>
  </div>
</li>

          </ul>

          <!-- ÚJ ÉTTEREM ADMINNAK -->
          <div v-if="user.role === 'admin'" class="card p-2">
            <h6>Új étterem (admin)</h6>
            <input
              v-model="newName"
              class="form-control mb-1"
              placeholder="Név"
            />
            <input
              v-model="newLocation"
              class="form-control mb-1"
              placeholder="Hely"
            />
            <button class="btn btn-sm btn-success" @click="addRestaurant">
              Mentés
            </button>
          </div>
        </div>

        <!-- RÉSZLETEK + ÉRTÉKELÉS -->
        <div class="col-md-7">
          <div v-if="!selected" class="alert alert-info">
            Válassz egy éttermet.
          </div>

          <div v-else>
            <h4>{{ selected.name }}</h4>
            <p class="text-muted">{{ selected.location }}</p>

            <h6 class="mt-3">Értékelések</h6>
            <div
              v-if="!selected.reviews || !selected.reviews.length"
              class="text-muted mb-2"
            >
              Legyél az első értékelő!
            </div>
            <ul v-else class="list-group mb-3">
              <li
                v-for="rev in selected.reviews"
                :key="rev.id"
                class="list-group-item"
              >
                <strong>{{ rev.rating }}/5</strong> – {{ rev.comment }}
                <div class="small text-muted">{{ rev.user_email }}</div>
              </li>
            </ul>

            <div class="card p-2">
              <h6>Új értékelés</h6>
              <div class="mb-2">
                <label class="form-label">Pontszám (1–5)</label>
                <input
                  v-model.number="rating"
                  type="number"
                  min="1"
                  max="5"
                  class="form-control"
                />
              </div>
              <div class="mb-2">
                <label class="form-label">Megjegyzés</label>
                <textarea
                  v-model="comment"
                  class="form-control"
                ></textarea>
              </div>
              <button class="btn btn-sm btn-primary" @click="sendReview">
                Küldés
              </button>
            </div>
          </div>
        </div>
      </div>

      <p v-if="msg" class="mt-3 text-danger">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const mode = ref("login");
const email = ref("");
const password = ref("");
const msg = ref("");
const user = ref(null);

const restaurants = ref([]);
const selected = ref(null);
const rating = ref(5);
const comment = ref("");
const newName = ref("");
const newLocation = ref("");

// regisztráció / login
const submitAuth = async () => {
  msg.value = "";
  const url =
    mode.value === "login"
      ? "http://localhost:3000/login"
      : "http://localhost:3000/register";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });
    const data = await res.json();
    if (!res.ok) {
      msg.value = data;
      return;
    }
    if (mode.value === "login") {
      user.value = data.user;
      email.value = "";
      password.value = "";
      msg.value = "";
      loadRestaurants();
    } else {
      mode.value = "login";
      msg.value = data.message;
    }
  } catch {
    msg.value = "Hálózati hiba";
  }
};

const logout = () => {
  user.value = null;
  selected.value = null;
  restaurants.value = [];
  msg.value = "";
};

const loadRestaurants = async () => {
  const res = await fetch("http://localhost:3000/api/restaurants");
  restaurants.value = await res.json();
};

const selectRestaurant = async (id) => {
  const res = await fetch(`http://localhost:3000/api/restaurants/${id}`);
  const data = await res.json();
  if (!res.ok) {
    msg.value = data;
    return;
  }
  selected.value = data;
};

const sendReview = async () => {
  if (!selected.value) return;
  const res = await fetch("http://localhost:3000/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      restaurantId: selected.value.id,
      userId: user.value.id,
      rating: rating.value,
      comment: comment.value
    })
  });
  const data = await res.json();
  if (!res.ok) {
    msg.value = data;
    return;
  }
  comment.value = "";
  rating.value = 5;
  await selectRestaurant(selected.value.id);
};

const addRestaurant = async () => {
  if (!newName.value || !newLocation.value) {
    msg.value = "Hiányzó adat";
    return;
  }
  const adminPass = prompt("Admin jelszó (admin@demo.hu):") || "";
  const res = await fetch("http://localhost:3000/api/restaurants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.value.email,
      password: adminPass,
      name: newName.value,
      location: newLocation.value
    })
  });
  const data = await res.json();
  if (!res.ok) {
    msg.value = data;
    return;
  }
  msg.value = data.message;
  newName.value = "";
  newLocation.value = "";
  loadRestaurants();
};
const deleteRestaurant = async (id) => {
  if (!confirm("Biztosan törlöd ezt az éttermet?")) return;

  const adminPass = prompt("Admin jelszó (admin@demo.hu):") || "";

  try {
    const res = await fetch(`http://localhost:3000/api/restaurants/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.value.email,
        password: adminPass
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.value = data;
      return;
    }

    msg.value = data.message;
    if (selected.value && selected.value.id === id) {
      selected.value = null;
    }
    loadRestaurants();
  } catch {
    msg.value = "Hálózati hiba törlésnél";
  }
};

</script>
