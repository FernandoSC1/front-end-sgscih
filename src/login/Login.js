// Login.js
import React, { useState } from 'react';

// Recebe a prop 'onLoginSuccess'
function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Simulação de login
    console.log('Dados do formulário:', { email, password });
    if (email === 'fernando' && password === '12345678' || email === 'estagiario' && password === '123456') {
      // Chama a função passada como prop
      onLoginSuccess();
    } else {
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div>
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Login</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className='login-button' type="submit">Entrar</button>
        </form> 
      </div>
      <footer className='footer-page'>
        <p>Desenvolvido por: Fernando da Silva Costa</p>
        <p>Versão: 1.0.0</p>
      </footer>
    </div>
  );
}

export default Login;
