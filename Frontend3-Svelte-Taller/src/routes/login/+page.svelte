<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { login, session, acceptHandoff } from '$lib/auth';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(() => {
    acceptHandoff();
    const s = session();
    if (s && (s.role === 'CARPENTER' || s.role === 'ADMIN')) goto('/');
  });

  async function submit() {
    error = '';
    loading = true;
    try {
      const s = await login(email.trim(), password);
      if (s.role !== 'CARPENTER' && s.role !== 'ADMIN') {
        error = 'Esta consola es para el taller (carpintero/admin)';
        localStorage.removeItem('carpinteria_session');
        return;
      }
      goto('/');
    } catch {
      error = 'Credenciales inválidas o servicio no disponible';
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <form class="card" on:submit|preventDefault={submit}>
    <div class="head">
      <span class="logo">ER</span>
      <h2>Taller — Entregas</h2>
      <p>Carpintería El Roble — acceso del taller</p>
    </div>
    <label>Email
      <input type="email" bind:value={email} required placeholder="carpintero@carpinteria.com" />
    </label>
    <label>Contraseña
      <input type="password" bind:value={password} required placeholder="••••••••" />
    </label>
    {#if error}<p class="error">{error}</p>{/if}
    <button type="submit" disabled={loading}>{loading ? 'Verificando…' : 'Ingresar'}</button>
  </form>
</main>

<style>
  main { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #F5F1EC; font-family: Inter, system-ui, sans-serif; }
  .card { background: #fff; padding: 36px 32px; border-radius: 12px; box-shadow: 0 8px 24px rgba(59,47,47,.12); display: flex; flex-direction: column; gap: 14px; width: 360px; }
  .head { text-align: center; margin-bottom: 8px; }
  .logo { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: #8B5A2B; color: #FAF7F2; font-size: 18px; font-weight: 800; margin-bottom: 12px; }
  .head h2 { margin: 0; color: #3B2F2F; font-size: 19px; }
  .head p { margin: 4px 0 0; color: #8a7f75; font-size: 13px; }
  label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #5c534a; font-weight: 600; }
  input { padding: 10px 12px; border-radius: 8px; border: 1px solid #ddd4c8; font-size: 14px; }
  .error { margin: 0; color: #a33; font-size: 13px; background: #fdf1f1; padding: 8px 12px; border-radius: 6px; }
  button { background: #8B5A2B; color: #fff; border: none; padding: 11px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; margin-top: 4px; }
  button:disabled { opacity: .6; }
</style>
