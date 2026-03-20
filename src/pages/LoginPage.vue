<template>
  <q-page class="login-page flex flex-center q-pa-md bg-grey-2">
    <q-card class="login-card full-width shadow-2 rounded-borders" flat bordered>
      <q-card-section class="text-center q-pt-xl q-pb-sm">
        <q-avatar color="primary" text-color="white" icon="account_balance" size="72px" />
        <div class="text-h5 text-weight-medium q-mt-md text-grey-9">AksaDigitex CFO</div>
        <div class="text-body2 text-grey-7 q-mt-xs">Finance & Operations Portal</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <q-form @submit="handleLogin" class="column q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Email"
            outlined
            lazy-rules
            :rules="[(val) => !!val || 'Please enter your email']"
          >
            <template #prepend>
              <q-icon name="mail" color="grey-7" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            outlined
            lazy-rules
            :rules="[(val) => !!val || 'Please enter your password']"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-7" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                color="grey-7"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="row justify-end no-wrap q-pt-xs">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              padding="xs sm"
              label="Forgot password?"
            />
          </div>

          <q-btn
            unelevated
            no-caps
            type="submit"
            color="primary"
            class="full-width q-mt-sm"
            size="md"
            label="Sign in"
            :loading="loading"
          >
            <template #loading>
              <q-spinner-dots class="on-left" />
              Signing in…
            </template>
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const router = useRouter();

const handleLogin = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    void router.push('/');
  }, 1500);
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  box-sizing: border-box;
}

.login-card {
  width: 100%;
  max-width: 420px;
}
</style>
