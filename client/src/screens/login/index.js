import './login.scss';
import { request } from '../../api';

export const loginPage = (el, router) => {
  const title = el('h2', { class: 'login__title' }, 'Вход в аккаунт');

  const inputLogin = el('input', {
    id: 'login',
    class: 'login__input input',
    name: 'login',
    type: 'text',
    placeholder: 'Введите логин',
  });

  const inputPass = el('input', {
    id: 'pass',
    class: 'login__input input',
    name: 'pass',
    type: 'password',
    placeholder: 'Введите пароль',
  });

  const lableLogin = el('label', { class: 'login__label' }, [
    el('span', { class: 'login__name' }, 'Логин'),
    inputLogin,
  ]);

  const lablePass = el('label', { class: 'login__label' }, [
    el('span', { class: 'login__name' }, 'Пароль'),
    inputPass,
  ]);

  const button = el('button', { class: 'login__button button-filled border-radius-7' }, 'Войти');

  const form = el('form', { id: 'auth_form', class: 'login__form' }, [
    title,
    lableLogin,
    lablePass,
    button,
    el('p', { id: 'error_message', class: 'login__error' }, ''),
  ]);

  authorization(form, router);
  [inputLogin, inputPass].forEach((input) => input.addEventListener('input', removeError));

  const page = el('section', { class: 'login' }, form);
  return page;
};

const authorization = (el, router) => {
  el.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputLogin = document.getElementById('login');
    const inputPass = document.getElementById('pass');

    let errors = 0;
    [inputLogin, inputPass].forEach((input) => {
      if (input.value.trim() == '') {
        input.classList.add('_error');
        addError('Укажите имя пользователя и пароль');
        errors += 1;
      } else if (input.value.includes(' ')) {
        input.classList.add('_error');
        addError('Нельзя использовать пробел');
        errors += 1;
      }
    });

    if (errors) return;

    const data = {
      login: inputLogin.value.trim().toLowerCase(),
      password: inputPass.value.trim(),
    };

    const response = await request.POST('login', data);
    if (response.error) {
      switch (response.error) {
        case 'No such user':
          addError('Пользователь не найден');
          inputLogin.classList.add('_error');
          break;
        case 'Invalid password':
          addError('Пароль введен не правильно');
          inputPass.classList.add('_error');
          break;
      }
    } else {
      sessionStorage.setItem('auth', response.payload.token);
      router.navigate('/');
    }
  });
};

const addError = (message) => {
  const textEl = document.getElementById('error_message');
  textEl.textContent = message;
  textEl.classList.add('_error');
};

const removeError = (e) => {
  const textEl = document.getElementById('error_message');
  textEl.textContent = '';
  textEl.classList.remove('_error');
  e.target.classList.remove('_error');
};
