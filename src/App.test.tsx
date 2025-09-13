import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Material UI app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Desafio Cadastro Pessoas/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders form fields', () => {
  render(<App />);
  const nameField = screen.getByLabelText(/Nome Completo/i);
  const emailField = screen.getByLabelText(/Email/i);
  expect(nameField).toBeInTheDocument();
  expect(emailField).toBeInTheDocument();
});

test('renders Material UI components', () => {
  render(<App />);
  const containedButton = screen.getByText(/Botão Contained/i);
  const outlinedButton = screen.getByText(/Botão Outlined/i);
  expect(containedButton).toBeInTheDocument();
  expect(outlinedButton).toBeInTheDocument();
});
