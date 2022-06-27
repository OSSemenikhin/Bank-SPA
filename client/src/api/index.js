/**
 * Copyright (c) 2021-present, Avk.
 */

export const API_URL = 'localhost:3000/';

const GET = function (route, token = false) {
  return new Promise((resolve, reject) => {
    fetchGet(route, token, resolve, reject);
  });
};

const POST = function (route, body = false, formdata = false) {
  return new Promise((resolve, reject) => {
    fetchPost(route, body, formdata, resolve, reject);
  });
};

const POSTcustom = function (route, body = false, formdata = false) {
  return new Promise((resolve, reject) => {
    fetchPostCustom(route, body, formdata, resolve, reject);
  });
};

const DELETE = function (route, token = false) {
  return new Promise((resolve, reject) => {
    fetchDelete(route, token, resolve, reject);
  });
};

const PUT = function (route, body = false) {
  return new Promise((resolve, reject) => {
    fetchPut(route, body, resolve, reject);
  });
};

const headers = {
  'Content-Type': 'application/json;charset=utf-8',
};

export const request = {
  GET,
  POST,
  POSTcustom,
  PUT,
  DELETE,
};

function fetchGet(route, token, resolve, reject) {
  if (token) {
    headers.authorization = 'Basic ' + token;
  }

  fetch(`http://${API_URL}${route}`, {
    method: 'GET',
    headers: headers,
  })
    .then((res) => res.json())
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(error);
    });
}

function fetchPost(route, body, formdata, resolve, reject) {
  if (body.token) {
    headers.login = 'Basic ' + body.token;
  }
  let body_ = JSON.stringify(body);
  if (formdata) {
    body_ = body;
  }

  fetch(`http://${API_URL}${route}`, {
    method: 'POST',
    // credentials: 'include',
    headers: headers,
    body: body_,
  })
    .then((res) => res.json())
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(error);
    });
}

function fetchPostCustom(url, body, formdata, resolve, reject) {
  if (body.token) {
    headers.login = 'Basic ' + body.token;
  }
  let body_ = JSON.stringify(body);
  if (formdata) {
    body_ = body;
  }

  fetch(`${url}`, {
    method: 'POST',
    // credentials: 'include',
    headers: headers,
    body: body_,
  })
    .then((res) => res.json())
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(error);
    });
}

function fetchPut(route, body, resolve, reject) {
  if (body.token) {
    headers.login = 'Basic ' + body.token;
  }

  fetch(`http://${API_URL}${route}`, {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(error);
    });
}

function fetchDelete(route, token, resolve, reject) {
  if (token) {
    headers.login = 'Basic ' + token;
  }

  fetch(`http://${API_URL}${route}`, {
    method: 'DELETE',
    headers: headers,
  })
    .then((res) => res.json())
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(error);
    });
}
