<template>
  <q-page class="login-wrapper relative-position flex flex-center">
    <!-- Background Elements -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <div class="glass-card shadow-15">
      <div class="card-content">
        <!-- Logo / Branding -->
        <div class="brand-section text-center q-mb-xl">
          <div class="logo-container q-mb-md relative-position">
            <q-icon name="account_balance" size="48px" color="primary" class="logo-icon" />
            <div class="glow-effect"></div>
          </div>
          <h1 class="text-h4 text-weight-bolder text-white q-ma-none brand-title">
            AksaDigitex <span class="text-primary">CFO</span>
          </h1>
          <p class="text-subtitle1 text-grey-4 q-mt-sm">Finance & Operations Portal</p>
        </div>

        <!-- Form Section -->
        <q-form @submit="handleLogin" class="login-form">
          <div class="input-group q-mb-md">
            <q-input
              v-model="email"
              type="email"
              label="Email Address"
              label-color="grey-4"
              color="primary"
              dark
              standout="bg-white text-dark"
              class="premium-input"
              hide-bottom-space
              lazy-rules
              :rules="[(val) => !!val || 'Please enter your email']"
            >
              <template v-slot:prepend>
                <q-icon name="mail" color="grey-5" />
              </template>
            </q-input>
          </div>

          <div class="input-group q-mb-xl">
            <q-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              label-color="grey-4"
              color="primary"
              dark
              standout="bg-white text-dark"
              class="premium-input"
              hide-bottom-space
              lazy-rules
              :rules="[(val) => !!val || 'Please enter your password']"
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-5" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-5"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>

          <div class="flex justify-between items-center q-mb-lg flex-wrap gap-2 text-white">
            <q-checkbox
              v-model="rememberMe"
              dark
              color="primary"
              label="Remember me"
              class="text-grey-4 text-subtitle2"
            />
            <a href="#" class="forgot-link text-primary text-subtitle2 text-weight-medium"
              >Forgot Password?</a
            >
          </div>

          <q-btn
            unelevated
            type="submit"
            color="primary"
            class="full-width premium-btn"
            :loading="loading"
          >
            <span class="text-weight-bold text-subtitle1">Sign In</span>
            <template v-slot:loading>
              <q-spinner-dots class="on-left" />
              Processing...
            </template>
          </q-btn>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const router = useRouter();

const handleLogin = () => {
  loading.value = true;
  // Simulate network request
  setTimeout(() => {
    loading.value = false;
    void router.push('/'); // Navigate to Dashboard
  }, 1500);
};
</script>

<style scoped lang="scss">
.login-wrapper {
  background: #0f172a; /* Deep slate background */
  min-height: 100vh;
  overflow: hidden;
}

/* Dynamic Animated Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  animation: float 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: rgba(37, 99, 235, 0.3); /* Primary Blue */
  top: -10%;
  left: -10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.25); /* Purple Secondary */
  bottom: -10%;
  right: -5%;
  animation-delay: -5s;
}

.shape-3 {
  width: 600px;
  height: 600px;
  background: rgba(16, 185, 129, 0.15); /* Emerald Green accent */
  top: 40%;
  left: 30%;
  animation-delay: -10s;
}

@keyframes float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 40px) scale(0.9);
  }
  100% {
    transform: translate(0, 0) scale(1);
  }
}

/* Glassmorphism Card */
.glass-card {
  width: 100%;
  max-width: 460px;
  background: rgba(30, 41, 59, 0.6); /* Slate 800 with opacity */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08); /* Subtle white border */
  border-radius: 24px;
  z-index: 1;
  padding: 4px; /* Space for a subtle inner gradient border effect could go here */
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
}

.card-content {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
  border-radius: 20px;
  padding: 48px 40px;
}

/* Brand Section Styling */
.logo-container {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
  position: relative;
}

.logo-icon {
  z-index: 2;
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: var(--q-primary);
  border-radius: 20px;
  filter: blur(25px);
  opacity: 0.4;
  z-index: 1;
}

.brand-title {
  letter-spacing: -0.5px;
  font-family: 'Inter', Roboto, sans-serif;
}

/* Form Styling */
.premium-input {
  /* Quasar specific overrides */
  :deep(.q-field__control) {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:before {
      display: none; /* Hide default bottom line */
    }

    &:hover {
      background: rgba(255, 255, 255, 0.06) !important;
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.q-field--focused .q-field__control) {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: var(--q-primary);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
}

.premium-btn {
  border-radius: 12px;
  height: 56px;
  background: linear-gradient(135deg, var(--q-primary) 0%, #1d4ed8 100%);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(255, 255, 255, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px var(--q-primary);

    &::after {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
}

.forgot-link {
  text-decoration: none;
  transition:
    color 0.2s,
    text-shadow 0.2s;

  &:hover {
    color: #60a5fa !important; /* Lighter primary color on hover */
    text-shadow: 0 0 8px rgba(96, 165, 250, 0.4);
  }
}

@media (max-width: 599px) {
  .glass-card {
    border-radius: 0;
    min-height: 100vh;
    border: none;
    background: rgba(15, 23, 42, 0.85); /* Solidify a bit more on mobile */
  }

  .card-content {
    border-radius: 0;
    padding: 32px 24px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .bg-shape {
    display: none; /* Disable complex shapes on mobile for performance */
  }
}
</style>
